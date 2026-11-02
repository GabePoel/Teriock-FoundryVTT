import { BaseRoll } from "../../dice/rolls/_module.mjs";
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
  /** @inheritDoc */
  _migrate(value, options, _state) {
    if (typeof value === "number") { value = this.model.migrateNumberToUnit(value); }
    else if (value === null) { value = {}; }
    // Make sure raw values are formulas or numbers as the model demands
    else if (!this.model.metadata.formula && typeof value?.raw === "string") {
      value = { ...value, raw: migrateFormulaToNumber(value.raw) };
    }
    return super._migrate(value, options, _state);
  }

  /**
   * Changes are applied directly to the raw value.
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
      const changeValue = this.model.metadata.formula
        ? FormulaField.multiply(String(change.value), String(1 / conversion))
        : Number(change.value) / conversion;
      change = { ...change, value: changeValue };
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
   * Whether the unit or raw value is locked.
   * @param {DataModel} model
   * @returns {boolean}
   */
  isLocked(model) {
    const lockedPaths = model.system?.lockedPaths;
    return Boolean(lockedPaths?.has(`${this.fieldPath}.raw`) || lockedPaths?.has(`${this.fieldPath}.unit`));
  }
}

/**
 * Convert a formula string to a number.
 * @param {string} raw
 * @returns {number|undefined}
 */
function migrateFormulaToNumber(raw) {
  if (!raw.trim()) { return undefined; }
  const number = Number(raw);
  if (Number.isFinite(number)) { return number; }
  try {
    const value = BaseRoll.minValue(raw);
    return Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}
