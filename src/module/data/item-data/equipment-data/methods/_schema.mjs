import { TextField } from "../../../shared/fields/_module.mjs";
import {
  modifiableFormula,
  modifiableNumber,
} from "../../../shared/fields/modifiable.mjs";

const { fields } = foundry.data;

/**
 * Defines the schema for equipment data fields.
 * Includes all equipment-specific fields such as damage, weight, equipment classes, and status flags.
 * @returns {object} The schema definition for equipment data fields.
 * @private
 */
export function _defineSchema() {
  return {
    description: new TextField({
      initial: "",
      label: "Description",
    }),
    equipped: new fields.BooleanField({
      initial: true,
      label: "Equipped",
    }),
    glued: new fields.BooleanField({
      initial: false,
      label: "Glued",
    }),
    shattered: new fields.BooleanField({
      initial: false,
      label: "Shattered",
    }),
    dampened: new fields.BooleanField({
      initial: false,
      label: "Dampened",
    }),
    consumable: new fields.BooleanField({
      initial: false,
      label: "Consumable",
    }),
    damage: new fields.SchemaField({
      base: modifiableFormula({
        deterministic: false,
      }),
      twoHanded: modifiableFormula({
        deterministic: false,
      }),
      types: new fields.SetField(new fields.StringField()),
    }),
    weight: modifiableNumber(),
    range: new fields.SchemaField({
      short: modifiableFormula(),
      long: modifiableFormula(),
      ranged: new fields.BooleanField({
        initial: false,
        label: "Ranged",
      }),
    }),
    equipmentClasses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.equipmentClasses,
      }),
    ),
    minStr: modifiableNumber({
      min: -3,
      initial: -3,
    }),
    fightingStyle: new fields.StringField({
      initial: null,
      label: "Style Bonus",
      nullable: true,
      choices: TERIOCK.index.weaponFightingStyles,
    }),
    av: modifiableNumber(),
    bv: modifiableNumber(),
    equipmentType: new fields.StringField({
      initial: "Equipment Type",
      label: "Equipment Type",
    }),
    price: new fields.NumberField({
      initial: 0,
      label: "Price",
    }),
    powerLevel: new fields.StringField({
      choices: TERIOCK.options.equipment.powerLevelShort,
      initial: "mundane",
      label: "Power Level",
    }),
    flaws: new TextField({
      initial: "",
      label: "Flaws",
    }),
    notes: new TextField({
      initial: "",
      label: "Notes",
    }),
    tier: modifiableFormula(),
    identified: new fields.BooleanField({
      initial: true,
      label: "Identified",
    }),
    reference: new fields.DocumentUUIDField({
      initial: null,
      nullable: true,
    }),
  };
}
