import { BaseRoll } from "../../dice/rolls/_module.mjs";
import {
  addFormula,
  boostFormula,
  downgradeDeterministicFormula,
  downgradeIndeterministicFormula,
  multiplyFormula,
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

  /** @inheritDoc */
  _applyChangeCustom(value, delta, _model, _change) {
    if (!delta || this.deterministic) return value;
    return boostFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeDowngrade(value, delta, _model, _change) {
    if (!value) return delta;
    if (this.deterministic) {
      return downgradeDeterministicFormula(value, delta);
    } else {
      return downgradeIndeterministicFormula(value, delta);
    }
  }

  /** @inheritDoc */
  _applyChangeMultiply(value, delta, _model, _change) {
    if (!value) return delta;
    return multiplyFormula(value, delta);
  }

  /** @inheritDoc */
  _applyChangeUpgrade(value, delta, _model, _change) {
    if (!value) return delta;
    if (this.deterministic) {
      return upgradeDeterministicFormula(value, delta);
    } else {
      return upgradeIndeterministicFormula(value, delta);
    }
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
}
