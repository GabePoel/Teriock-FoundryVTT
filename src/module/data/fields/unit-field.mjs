import FormulaField from "./formula-field/formula-field.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * @import { ActiveEffectChangeData } from "@client/documents/_types.mjs";
 * @import { DataModel } from "@common/abstract/_module.mjs";
 * @import BaseUnitModel from "../models/unit-models/base-unit-model/base-unit-model.mjs";
 */

/**
 * Change types with values assumed to be in the base unit.
 * @type {Set<string>}
 */
const BASE_UNIT_CHANGE_TYPES = new Set(["add", "downgrade", "override", "subtract", "upgrade"]);

/**
 * Special case {@link EmbeddedDataField} for a {@link BaseUnitModel}.
 */
export default class UnitField extends EmbeddedDataField {
  /**
   * Changes are applied directly to the raw formula.
   * @inheritDoc
   * @param {BaseUnitModel} value
   * @param {DataModel} model
   * @param {ActiveEffectChangeData} change
   * @returns {BaseUnitModel|undefined}
   */
  applyChange(value, model, change, options = {}) {
    if (!this.canApplyChange(value, model)) { return undefined; }
    // Quantities are assumed to be in the model's base
    const conversion = value.conversion;
    if (BASE_UNIT_CHANGE_TYPES.has(change.type) && conversion !== 1) {
      change = { ...change, value: FormulaField.multiply(String(change.value), String(1 / conversion)) };
    }
    value.raw = this.fields.raw.applyChange(value.raw, model, change, options);
    return value;
  }

  /**
   * Whether changes can be applied.
   * @param {BaseUnitModel} value
   * @param {DataModel} model
   * @returns {boolean}
   */
  canApplyChange(value, model) {
    return value?.unitType === "finite" && !this.isLocked(model);
  }

  /**
   * Whether the unit or raw formula is locked.
   * @param {DataModel} model
   * @returns {boolean}
   */
  isLocked(model) {
    const lockedPaths = model.system?.lockedPaths;
    return Boolean(lockedPaths?.has(`${this.fieldPath}.raw`) || lockedPaths?.has(`${this.fieldPath}.unit`));
  }
}
