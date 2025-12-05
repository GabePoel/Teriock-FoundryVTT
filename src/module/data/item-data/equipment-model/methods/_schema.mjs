import { EvaluationField, TextField } from "../../../shared/fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Defines the schema for equipment data fields.
 * Includes all equipment-specific fields such as damage, weight, equipment classes, and status flags.
 * @returns {object} The schema definition for equipment data fields.
 * @private
 */
export function _defineSchema() {
  return {
    consumable: new fields.BooleanField({
      initial: false,
      label: "Consumable",
    }),
    damage: new fields.SchemaField({
      base: new EvaluationField({
        deterministic: false,
      }),
      twoHanded: new EvaluationField({
        deterministic: false,
      }),
      types: new fields.SetField(new fields.StringField()),
    }),
    description: new TextField({
      initial: "",
      label: "Description",
    }),
    equipmentClasses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.equipmentClasses,
      }),
    ),
    equipmentType: new fields.StringField({
      initial: "Equipment Type",
      label: "Equipment Type",
    }),
    powerLevel: new fields.StringField({
      choices: TERIOCK.options.equipment.powerLevelShort,
      initial: "mundane",
      label: "Power Level",
    }),
    price: new fields.NumberField({
      initial: 0,
      label: "Price",
    }),
    weight: new EvaluationField(),
  };
}
