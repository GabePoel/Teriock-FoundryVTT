import { BaseRoll } from "../../dice/rolls/_module.mjs";
import * as formula from "../../helpers/formula.mjs";

const { StringField } = foundry.data.fields;

/**
 * Special case {@link StringField} which represents a formula.
 * @extends {Teriock.Fields._FormulaFieldOptions}
 */
export default class FormulaField extends StringField {
  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, { deterministic: false, required: false });
  }

  /**
   * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options]
   * @param {DataFieldContext} [context]
   */
  constructor(options = {}, context = {}) {
    super(options, context);
  }

  /** @inheritDoc */
  _applyChangeAdd(value, delta, _model, _change) {
    return formula.addFormula(value ?? "", delta);
  }

  /**
   * Apply a "boost" change to this field.
   * @param {Teriock.System.FormulaString} value
   * @param {string|string[]} delta
   * @param {DataModel} _model
   * @param {ActiveEffectChangeData} _change
   * @returns {Teriock.System.FormulaString}
   */
  _applyChangeBoost(value, delta, _model, _change) {
    if (!delta || this.deterministic) { return value; }
    return formula.boostFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeDowngrade(value, delta, _model, _change) {
    if (!value) { return delta; }
    return this.deterministic
      ? formula.downgradeDeterministicFormula(value, delta)
      : formula.downgradeIndeterministicFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeMultiply(value, delta, _model, _change) {
    return formula.multiplyFormula(value ?? "0", delta);
  }

  /** @inheritDoc */
  _applyChangeSubtract(value, delta, _model, _change) {
    return formula.subtractFormula(value ?? "", delta);
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
    if (!delta || this.deterministic) { return value; }
    return formula.addTypesToFormula(value, delta);
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
    if (!delta || this.deterministic) { return value; }
    return formula.removeTypesFromFormula(value, delta);
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
    if (!delta || this.deterministic) { return value; }
    return formula.setTypesOfFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeUpgrade(value, delta, _model, _change) {
    if (!value) { return delta; }
    return this.deterministic
      ? formula.upgradeDeterministicFormula(value, delta)
      : formula.upgradeIndeterministicFormula(value, delta);
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
    if (this.deterministic) {
      const roll = new BaseRoll(value, {});
      if (!roll.isDeterministic) { throw new Error(`Deterministic formula must not contain dice terms: ${value}`); }
    }
    super._validateType(value);
  }

  /** @inheritDoc */
  applyChange(value, model, change, { replacementData = {} } = {}) {
    let updated;
    const delta = change.value;
    if (change.type === "boost") { updated = this._applyChangeBoost(value, delta, model, change); }
    else if (change.type === "typeAdd") { updated = this._applyChangeTypeAdd(value, delta, model, change); }
    else if (change.type === "typeRemove") { updated = this._applyChangeTypeRemove(value, delta, model, change); }
    else if (change.type === "typeSet") { updated = this._applyChangeTypeSet(value, delta, model, change); }
    else { return super.applyChange(value, model, change, { replacementData }); }
    return this.initialize(updated, model);
  }

  /** @inheritDoc */
  toFormGroup(groupConfig = {}, inputConfig = {}) {
    groupConfig.classes ||= [];
    groupConfig.classes.push("formula-input");
    return super.toFormGroup(groupConfig, inputConfig);
  }
}
