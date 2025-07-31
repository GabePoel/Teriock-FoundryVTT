const { fields } = foundry.data;
import { equipmentOptions } from "../../../../helpers/constants/equipment-options.mjs";
import { weaponFightingStyles } from "../../../../helpers/constants/generated/weapon-fighting-styles.mjs";
import { FormulaField } from "../../../shared/fields.mjs";

/**
 * Defines the schema for equipment data fields.
 * Includes all equipment-specific fields such as damage, weight, equipment classes, and status flags.
 *
 * @returns {object} The schema definition for equipment data fields.
 * @private
 */
export function _defineSchema() {
  return {
    wikiNamespace: new fields.StringField({
      initial: "Equipment",
      gmOnly: true,
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
    quantity: new fields.NumberField({
      initial: 1,
      integer: true,
      label: "Quantity",
      min: 0,
    }),
    maxQuantity: new fields.SchemaField({
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
    }),
    ranged: new fields.BooleanField({
      initial: false,
      label: "Ranged",
    }),
    damage: new FormulaField({
      initial: "0",
      label: "Damage",
      deterministic: false,
    }),
    twoHandedDamage: new FormulaField({
      initial: "0",
      label: "Two-Handed Damage",
      deterministic: false,
    }),
    damageTypes: new fields.SetField(new fields.StringField()),
    weight: new fields.NumberField({
      initial: 0,
      integer: true,
      label: "Weight",
      min: 0,
    }),
    range: new fields.NumberField({
      initial: 0,
      integer: true,
      label: "Range",
      min: 0,
    }),
    shortRange: new fields.NumberField({
      initial: 0,
      integer: true,
      label: "Short Range",
      min: 0,
    }),
    equipmentClasses: new fields.SetField(
      new fields.StringField({
        choices: equipmentOptions.equipmentClasses,
      }),
    ),
    minStr: new fields.NumberField({
      initial: -3,
      integer: true,
      min: -3,
      label: "Min Strength",
    }),
    sb: new fields.StringField({
      initial: null,
      label: "Style Bonus",
      nullable: true,
      choices: weaponFightingStyles,
    }),
    av: new fields.NumberField({
      initial: 0,
      integer: true,
      label: "Armor Value",
      min: 0,
    }),
    bv: new fields.NumberField({
      initial: 0,
      integer: true,
      label: "Block Value",
      min: 0,
    }),
    specialRules: new fields.HTMLField({
      hint: "The conditions under which style bonus is granted.",
      initial: "",
      label: "Special Rules",
    }),
    equipmentType: new fields.StringField({
      initial: "Equipment Type",
      label: "Equipment Type",
    }),
    powerLevel: new fields.StringField({
      choices: equipmentOptions.powerLevelShort,
      initial: "mundane",
      label: "Power Level",
    }),
    flaws: new fields.HTMLField({
      initial: "",
      label: "Flaws",
    }),
    notes: new fields.HTMLField({
      initial: "",
      label: "Notes",
    }),
    tier: new fields.SchemaField({
      raw: new FormulaField({
        initial: "",
        label: "Tier (Raw)",
        deterministic: true,
      }),
      derived: new fields.NumberField({
        initial: 0,
        label: "Tier (Derived)",
      }),
    }),
    identified: new fields.BooleanField({
      initial: true,
      label: "Identified",
    }),
    reference: new fields.DocumentUUIDField({
      initial: null,
      nullable: true,
      gmOnly: true,
    }),
  };
}
