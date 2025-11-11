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
    dampened: new fields.BooleanField({
      initial: false,
      label: "Dampened",
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
    equipped: new fields.BooleanField({
      initial: false,
      label: "Equipped",
    }),
    glued: new fields.BooleanField({
      initial: false,
      label: "Glued",
    }),
    identification: new fields.SchemaField(
      {
        flaws: new TextField({
          gmOnly: true,
          initial: "",
          label: "Unidentified Flaws",
        }),
        identified: new fields.BooleanField({
          gmOnly: true,
          initial: true,
          label: "Identified",
        }),
        name: new fields.StringField({
          gmOnly: true,
          initial: "",
          label: "Unidentified Name",
        }),
        notes: new TextField({
          gmOnly: true,
          initial: "",
          label: "Unidentified Notes",
        }),
        powerLevel: new fields.StringField({
          choices: TERIOCK.options.equipment.powerLevelShort,
          gmOnly: true,
          initial: "mundane",
          label: "Unidentified Power Level",
        }),
        read: new fields.BooleanField({
          gmOnly: true,
          initial: true,
          label: "Read",
        }),
      },
      {
        gmOnly: true,
      },
    ),
    minStr: modifiableNumber({
      min: -3,
      initial: -3,
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
    shattered: new fields.BooleanField({
      initial: false,
      label: "Shattered",
    }),
    tier: modifiableFormula(),
    weight: modifiableNumber(),
  };
}
