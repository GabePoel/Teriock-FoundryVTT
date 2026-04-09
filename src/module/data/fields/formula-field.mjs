import { BaseRoll } from "../../dice/rolls/_module.mjs";
import {
  addFormula,
  addTypesToFormula,
  boostFormula,
  downgradeDeterministicFormula,
  downgradeIndeterministicFormula,
  multiplyFormula,
  removeTypesFromFormula,
  setTypesOfFormula,
  upgradeDeterministicFormula,
  upgradeIndeterministicFormula,
} from "../../helpers/formula.mjs";
import EnhancedStringField from "./enhanced-string-field.mjs";

/**
 * Special case {@link StringField} which represents a formula.
 */
export default class FormulaField extends EnhancedStringField {
  /**
   * @param {StringFieldOptions & Teriock.Fields._FormulaFieldOptions} [options] - Options which configure
   * the behavior of the field.
   * @param {DataFieldContext} [context] - Additional context which describes the field.
   */
  constructor(options = {}, context = {}) {
    super(options, context);
  }

  /** @inheritdoc */
  static get _defaults() {
    return foundry.utils.mergeObject(super._defaults, {
      deterministic: false,
      required: true,
    });
  }

  /** @inheritDoc */
  _applyChangeAdd(value, delta, _model, _change) {
    if (!value) return delta;
    return addFormula(value, delta);
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
    if (!delta || this.deterministic) return value;
    return boostFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeCustom(value, delta, _model, _change) {
    if (!delta || this.deterministic) return value;
    return boostFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeDowngrade(value, delta, _model, _change) {
    if (!value) return delta;
    if (this.deterministic) return downgradeDeterministicFormula(value, delta);
    return downgradeIndeterministicFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeMultiply(value, delta, _model, _change) {
    if (!value) return delta;
    return multiplyFormula(value, delta);
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
    if (!delta || this.deterministic) return value;
    return addTypesToFormula(value, delta);
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
    if (!delta || this.deterministic) return value;
    return removeTypesFromFormula(value, delta);
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
    if (!delta || this.deterministic) return value;
    return setTypesOfFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeUpgrade(value, delta, _model, _change) {
    if (!value) return delta;
    if (this.deterministic) return upgradeDeterministicFormula(value, delta);
    return upgradeIndeterministicFormula(value, delta);
  }

  /** @inheritDoc */
  _castChangeDelta(delta) {
    return this._cast(delta).trim();
  }

  /** @inheritdoc */
  _validateType(value) {
    if (this.deterministic) {
      const roll = new BaseRoll(value, {});
      if (!roll.isDeterministic) {
        throw new Error(`must not contain dice terms: ${value}`);
      }
    }
    super._validateType(value);
  }

  /** @inheritDoc */
  applyChange(value, model, change, { replacementData = {} } = {}) {
    let updated;
    const delta = change.value;
    if (change.type === "boost") {
      updated = this._applyChangeBoost(value, delta, model, change);
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
}
