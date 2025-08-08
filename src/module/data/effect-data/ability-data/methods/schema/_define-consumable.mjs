import { FormulaField } from "../../../../shared/fields.mjs";

const { fields } = foundry.data;

/**
 * Defines the consumable fields for Teriock ability data schema.
 *
 * @param {object} schema - The base schema object to extend.
 * @returns {object} Schema object with consumable fields added.
 * @private
 *
 * @example
 * // Add consumable fields to a schema.
 * const schema = _defineConsumable(schema);
 */
export function _defineConsumable(schema) {
  schema.consumable = new fields.BooleanField({
    initial: false,
    label: "Consumable",
  });
  schema.quantity = new fields.NumberField({
    initial: 1,
    integer: true,
    label: "Quantity",
    min: 0,
  });
  schema.maxQuantity = new fields.SchemaField({
    raw: new FormulaField({
      label: "Max Quantity (Raw)",
      initial: "",
      deterministic: true,
    }),
    derived: new fields.NumberField({
      initial: 0,
      integer: true,
      label: "Max Quantity (Derived)",
      min: 0,
    }),
  });
  return schema;
}
