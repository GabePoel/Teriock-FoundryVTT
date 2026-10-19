import { BaseRoll } from "../../../dice/rolls/_module.mjs";

const { StringField } = foundry.data.fields;

/**
 * @import { ActiveEffectChangeData } from "@client/documents/_types.mjs";
 * @import { DataModel } from "@common/abstract/_module.mjs";
 * @import { DataFieldContext, StringFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * Special case {@link StringField} which represents a formula.
 * @implements {Teriock.Fields._FormulaFieldOptions}
 */
export default class FormulaField extends StringField {
  /**
   * Apply a function to the types of every term in a formula.
   * @param {Teriock.System.FormulaString} formula
   * @param {Iterable<Identifier>} types
   * @param {(existing: Set<string>, types: Set<string>) => Set<string>} fn
   * @returns {Teriock.System.FormulaString}
   */
  static #processTypes(formula, types, fn) {
    if (["number", "string"].includes(typeof types)) { types = [types.toString()]; }
    if (!FormulaField.exists(formula)) { return formula; }
    types = new Set(Array.from(types).filter(t => teriock.utils.isKebabCase(t)));
    const roll = new BaseRoll(formula);
    for (const term of roll._allTerms) {
      const existing = new Set(term.flavor.toLowerCase().split(" ").map(type => type.trim()).filter(Boolean));
      term.options.flavor = Array.from(fn(existing, types)).filter(Boolean).join(" ");
    }
    return roll.formula;
  }

  /** @inheritdoc */
  static get _defaults() {
    return Object.assign(super._defaults, { deterministic: false, required: false });
  }

  /**
   * Add something to a formula.
   * @param {Teriock.System.FormulaString} value - Original formula.
   * @param {Teriock.System.FormulaString} delta - Modification to formula.
   * @returns {Teriock.System.FormulaString}
   */
  static add(value, delta) {
    const operator = delta.startsWith("-") ? "-" : "+";
    const minus = operator === "-" ? "-" : "";
    delta = delta.replace(/^[+-]/, "").trim();
    if (!FormulaField.exists(value)) { return `${minus} ${delta}`.trim(); }
    if (!FormulaField.exists(delta)) { return value; }
    return `${value} ${operator} ${delta}`;
  }

  /**
   * Add types to a formula that supports them. All types must be identifiers.
   * @param {Teriock.System.FormulaString} formula
   * @param {Iterable<Identifier>} types
   * @returns {Teriock.System.FormulaString}
   */
  static addTypes(formula, types) {
    return FormulaField.#processTypes(formula, types, (existing, types) => existing.union(types));
  }

  /**
   * Boost a formula.
   * @param {Teriock.System.FormulaString} value - Original formula.
   * @param {Teriock.System.FormulaString} delta - Modification to formula.
   * @returns {Teriock.System.FormulaString}
   */
  static boost(value, delta) {
    if (FormulaField.exists(value) && FormulaField.exists(delta)) { return `sb(${value}, ${delta})`; }
    return value;
  }

  /**
   * Downgrade a formula deterministically.
   * @param {Teriock.System.FormulaString} value - Original formula.
   * @param {Teriock.System.FormulaString} delta - Modification to formula.
   * @returns {Teriock.System.FormulaString}
   */
  static downgradeDeterministic(value, delta) {
    const terms = new BaseRoll(value, {}).terms;
    if (terms.length === 1 && terms[0]?.fn === "min") { return value.replace(/\)$/, `, ${delta})`); }
    return `min(${value}, ${delta})`;
  }

  /**
   * Downgrade a formula indeterministically.
   * @param {Teriock.System.FormulaString} value - Original formula.
   * @param {Teriock.System.FormulaString} delta - Modification to formula.
   * @returns {Teriock.System.FormulaString}
   */
  static downgradeIndeterministic(value, delta) {
    if (BaseRoll.meanValue(delta) <= BaseRoll.meanValue(value)) { return delta; }
    return value;
  }

  /**
   * Check if a formula would exist.
   * @param {Teriock.System.FormulaString|number} formula
   * @returns {boolean}
   */
  static exists(formula) {
    return Boolean(formula)
      && ((typeof formula === "string" && formula.trim() !== "0") || (typeof formula === "number"));
  }

  /**
   * Multiply a formula with something.
   * @param {Teriock.System.FormulaString} value - Original formula.
   * @param {Teriock.System.FormulaString} delta - Modification to formula.
   * @returns {Teriock.System.FormulaString}
   */
  static multiply(value, delta) {
    if (Number(delta) === 1) { return value; }
    const valueString = new BaseRoll(value, {}).terms.length > 1 ? `(${value})` : value;
    const deltaString = new BaseRoll(delta, {}).terms.length > 1 ? `(${delta})` : delta;
    return `${valueString} * ${deltaString}`;
  }

  /**
   * Remove types from a formula that supports them. All types must be identifiers.
   * @param {Teriock.System.FormulaString} formula
   * @param {Iterable<Identifier>} types
   * @returns {Teriock.System.FormulaString}
   */
  static removeTypes(formula, types) {
    return FormulaField.#processTypes(formula, types, (existing, types) => existing.difference(types));
  }

  /**
   * Set types of a formula that supports them. All types must be identifiers.
   * @param {Teriock.System.FormulaString} formula
   * @param {Iterable<Identifier>} types
   * @returns {Teriock.System.FormulaString}
   */
  static setTypes(formula, types) {
    return FormulaField.#processTypes(formula, types, (_existing, types) => types);
  }

  /**
   * Substitute a formula with a new one where the substitution term is the old formula.
   * @param {Teriock.System.FormulaString} value
   * @param {Teriock.System.FormulaString} delta
   * @param {string} [substitutionTerm="base"]
   * @returns {Teriock.System.FormulaString}
   */
  static substitute(value, delta, substitutionTerm = "base") {
    if (!FormulaField.exists(value)) { return delta; }
    return BaseRoll.replaceFormulaData(delta, { [substitutionTerm]: value });
  }

  /**
   * Subtract something from a formula.
   * @param {Teriock.System.FormulaString} value - Original formula.
   * @param {Teriock.System.FormulaString} delta - Modification to formula.
   * @returns {Teriock.System.FormulaString}
   */
  static subtract(value, delta) {
    if (!FormulaField.exists(delta)) { return value; }
    delta = delta.trim();
    const isCompound = new BaseRoll(delta.replace(/^[+-]/, ""), {}).terms.length > 1;
    if (isCompound) { return FormulaField.add(value, `-(${delta})`); }
    return FormulaField.add(value, delta.startsWith("-") ? delta.slice(1) : `-${delta.replace(/^\+/, "")}`);
  }

  /**
   * Add any number of formulas together.
   * @param {...Teriock.System.FormulaString} formulas
   * @returns {Teriock.System.FormulaString}
   */
  static sum(...formulas) {
    return formulas.reduce((value, delta) => FormulaField.add(value, delta), "");
  }

  /**
   * Upgrade a formula deterministically.
   * @param {Teriock.System.FormulaString} value - Original formula.
   * @param {Teriock.System.FormulaString} delta - Modification to formula.
   * @returns {Teriock.System.FormulaString}
   */
  static upgradeDeterministic(value, delta) {
    const terms = new BaseRoll(value, {}).terms;
    if (terms.length === 1 && terms[0]?.fn === "max") { return value.replace(/\)$/, `, ${delta})`); }
    return `max(${value}, ${delta})`;
  }

  /**
   * Upgrade a formula indeterministically.
   * @param {Teriock.System.FormulaString} value - Original formula.
   * @param {Teriock.System.FormulaString} delta - Modification to formula.
   * @returns {Teriock.System.FormulaString}
   */
  static upgradeIndeterministic(value, delta) {
    if (BaseRoll.meanValue(delta) >= BaseRoll.meanValue(value)) { return delta; }
    return value;
  }

  /**
   * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options = {}, context = {}) {
    super(options, context);
    this.#deterministic = options.deterministic;
  }

  /** @type {boolean} */
  #deterministic;

  /** @inheritDoc */
  _applyChangeAdd(value, delta, _model, _change) {
    return FormulaField.add(value ?? "", delta);
  }

  /**
   * Apply a "boost" change to this field.
   * @param {Teriock.System.FormulaString} value
   * @param {Teriock.System.FormulaString} delta
   * @param {DataModel} _model
   * @param {ActiveEffectChangeData} _change
   * @returns {Teriock.System.FormulaString}
   */
  _applyChangeBoost(value, delta, _model, _change) {
    if (!delta || this.#deterministic) { return value; }
    return FormulaField.boost(value, delta);
  }

  /** @inheritDoc */
  _applyChangeDowngrade(value, delta, _model, _change) {
    if (!value) { return delta; }
    return this.#deterministic
      ? FormulaField.downgradeDeterministic(value, delta)
      : FormulaField.downgradeIndeterministic(value, delta);
  }

  /** @inheritDoc */
  _applyChangeMultiply(value, delta, _model, _change) {
    return FormulaField.multiply(value ?? "0", delta);
  }

  /**
   * Apply a "substitute" change to this field.
   * @param {Teriock.System.FormulaString} value
   * @param {Teriock.System.FormulaString} delta
   * @param {DataModel} _model
   * @param {ActiveEffectChangeData} _change
   * @returns {Teriock.System.FormulaString}
   */
  _applyChangeSubstitute(value, delta, _model, _change) {
    return FormulaField.substitute(value ?? "", delta ?? "");
  }

  /** @inheritDoc */
  _applyChangeSubtract(value, delta, _model, _change) {
    return FormulaField.subtract(value ?? "", delta);
  }

  /**
   * Apply a "typeAdd" change to this field.
   * @param {Teriock.System.FormulaString} value
   * @param {string|string[]} delta
   * @param {DataModel} _model
   * @param {ActiveEffectChangeData} _change
   * @returns {Teriock.System.FormulaString}
   */
  _applyChangeTypeAdd(value, delta, _model, _change) {
    if (!delta || this.#deterministic) { return value; }
    return FormulaField.addTypes(value, delta);
  }

  /**
   * Apply a "typeRemove" change to this field.
   * @param {Teriock.System.FormulaString} value
   * @param {string|string[]} delta
   * @param {DataModel} _model
   * @param {ActiveEffectChangeData} _change
   * @returns {Teriock.System.FormulaString}
   */
  _applyChangeTypeRemove(value, delta, _model, _change) {
    if (!delta || this.#deterministic) { return value; }
    return FormulaField.removeTypes(value, delta);
  }

  /**
   * Apply a "typeSet" change to this field.
   * @param {Teriock.System.FormulaString} value
   * @param {string|string[]} delta
   * @param {DataModel} _model
   * @param {ActiveEffectChangeData} _change
   * @returns {Teriock.System.FormulaString}
   */
  _applyChangeTypeSet(value, delta, _model, _change) {
    if (!delta || this.#deterministic) { return value; }
    return FormulaField.setTypes(value, delta);
  }

  /** @inheritDoc */
  _applyChangeUpgrade(value, delta, _model, _change) {
    if (!value) { return delta; }
    return this.#deterministic
      ? FormulaField.upgradeDeterministic(value, delta)
      : FormulaField.upgradeIndeterministic(value, delta);
  }

  /** @inheritDoc */
  _castChangeDelta(delta) {
    return this._cast(delta).trim();
  }

  /** @inheritDoc */
  _toInput(config) {
    config.context ??= "actor";
    const input = super._toInput(config);
    if (input.tagName !== "INPUT") { return input; }
    config.value ??= this.getInitialValue({}) ?? "";
    return foundry.applications.elements.HTMLFormulaInputElement.create(config);
  }

  /** @inheritdoc */
  _validateType(value) {
    if (this.#deterministic) {
      const roll = new BaseRoll(value, {});
      if (!roll.isDeterministic) {
        throw new Error(`Deterministic formula must not contain dice terms: ${value}`);
      }
    }
    return super._validateType(value);
  }

  /** @inheritDoc */
  applyChange(value, model, change, { replacementData = {} } = {}) {
    let updated;
    const delta = change.value;
    if (change.type === "boost") {
      updated = this._applyChangeBoost(value, delta, model, change);
    } else if (change.type === "substitute") {
      updated = this._applyChangeSubstitute(value, delta, model, change);
    } else if (change.type === "typeAdd") {
      updated = this._applyChangeTypeAdd(value, delta, model, change);
    } else if (change.type === "typeRemove") {
      updated = this._applyChangeTypeRemove(value, delta, model, change);
    } else if (change.type === "typeSet") {
      updated = this._applyChangeTypeSet(value, delta, model, change);
    } else {
      return super.applyChange(value, model, change, { replacementData });
    }
    return this.initialize(updated, model);
  }

  /** @inheritDoc */
  toFormGroup(groupConfig = {}, inputConfig = {}) {
    groupConfig.classes ||= [];
    groupConfig.classes.push("formula-input");
    groupConfig.units ??= _loc(`TERIOCK.TERMS.Formula.${this.#deterministic ? "deterministic" : "rollable"}`);
    return super.toFormGroup(groupConfig, inputConfig);
  }
}
