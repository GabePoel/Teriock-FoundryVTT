import { pseudoHooks } from "../../../../../constants/pseudo-hooks.mjs";
import {
  FormulaField,
  TeriockArrayField,
  TeriockRecordField,
} from "../../../../shared/fields.mjs";
import {
  combatExpirationMethodField,
  combatExpirationSourceTypeField,
  combatExpirationTimingField,
} from "../../../shared/shared-fields.mjs";

const { fields } = foundry.data;

/**
 * Creates a field for consequence rolls configuration.
 *
 * This field allows defining various roll formulas for different effect types:
 * - Damage, drain, wither rolls
 * - Healing and revitalization rolls
 * - Temporary HP/MP manipulation
 * - Sleep, kill, and other special effects
 *
 * Relevant wiki pages:
 * - [Damage types](https://wiki.teriock.com/index.php/Category:Damage_types)
 * - [Drain types](https://wiki.teriock.com/index.php/Category:Drain_types)
 *
 * @returns {TeriockRecordField} Field for configuring consequence rolls
 * @private
 *
 * @example
 * // Create roll fields
 * const rollsField = consequenceRollsField();
 */
export function consequenceRollsField() {
  return new TeriockRecordField(
    new FormulaField({ nullable: true, deterministic: false }),
    {
      label: "Rolls",
      hint: "The rolls that are made as part of the consequence.",
    },
    undefined,
  );
}

/**
 * Creates a field for consequence changes configuration.
 *
 * This field defines changes that are applied to the target as part of the consequence.
 *
 * @returns {TeriockArrayField} Field for configuring consequence changes
 * @private
 *
 * @example
 * // Create changes field
 * const changesField = consequenceChangesField();
 */
export function consequenceChangesField() {
  return new TeriockArrayField(
    new fields.SchemaField({
      key: new fields.StringField({ initial: "" }),
      mode: new fields.NumberField({
        initial: 4,
        choices: {
          0: "Custom",
          1: "Multiply",
          2: "Add",
          3: "Downgrade",
          4: "Upgrade",
          5: "Override",
        },
      }),
      value: new fields.StringField({ initial: "" }),
      priority: new fields.NumberField({ initial: 20 }),
    }),
    {
      label: "Changes",
      hint: "Changes made to the target's attributes as part of the ability's ongoing effect.",
    },
  );
}

/**
 * Creates a field for ability-specific expiration data.
 *
 * @returns {SchemaField}
 */
function abilityExpirationField() {
  return new fields.SchemaField({
    combat: new fields.SchemaField({
      who: new fields.SchemaField({
        type: combatExpirationSourceTypeField(),
      }),
      what: combatExpirationMethodField(),
      when: combatExpirationTimingField(),
    }),
  });
}

/**
 * Creates a field for consequence data configuration.
 *
 * This field defines what effects apply to targets at different proficiency levels:
 * - **Statuses**: Conditions applied to the target
 * - **Damage**: Damage formulas applied
 * - **Drain**: Drain formulas effects
 * - **Changes**: Effect changes to target properties
 *
 * @returns {SchemaField} Field for configuring applies data
 *
 * @example
 * // Create applies field
 * const appliesField = appliesField();
 */
function consequenceField() {
  return new fields.SchemaField({
    statuses: new fields.SetField(
      new fields.StringField({
        choices: CONFIG.TERIOCK.conditions,
      }),
      {
        label: "Conditions",
        hint: "Conditions applied as part of the ability's ongoing effect. These are not applied as separate conditions, but merged into an ongoing effect.",
      },
    ),
    startStatuses: new fields.SetField(
      new fields.StringField({
        choices: CONFIG.TERIOCK.conditions,
      }),
      {
        label: "Apply Conditions",
        hint: "Conditions that may be immediately applied when the ability is used. They exist independently of the ability.",
      },
    ),
    endStatuses: new fields.SetField(
      new fields.StringField({
        choices: CONFIG.TERIOCK.conditions,
      }),
      {
        label: "Remove Conditions",
        hint: "Conditions that may be immediately removed when the ability is used This only works on conditions that exist independently of the ability.",
      },
    ),
    rolls: consequenceRollsField(),
    hacks: new fields.SetField(
      new fields.StringField({
        choices: {
          arm: "Arm",
          leg: "Leg",
          body: "Body",
          eye: "Eye",
          ear: "Ear",
          mouth: "Mouth",
          nose: "Nose",
        },
      }),
      {
        label: "Hacks",
        hint: "Types of hack damage that may be applied by the ability.",
      },
    ),
    checks: new fields.SetField(
      new fields.StringField({
        choices: CONFIG.TERIOCK.tradecraftOptionsList,
      }),
      {
        label: "Tradecraft Checks",
        hint: "Tradecraft checks that may be made as part of the ability.",
      },
    ),
    duration: new fields.NumberField({
      hint: "Increase in the duration (in seconds) of an effect made as part of the ability. If this is nonzero, it overrides the default duration.",
      initial: 0,
      label: "Duration",
    }),
    changes: consequenceChangesField(),
    standardDamage: new fields.BooleanField({
      initial: false,
      label: "Standard Damage",
      hint: "Can this deal standard damage?",
    }),
    expiration: new fields.SchemaField({
      normal: abilityExpirationField(),
      crit: abilityExpirationField(),
      changeOnCrit: new fields.BooleanField({
        initial: false,
        label: "Special Crit Expiration",
        hint: "Should the combat timing expiration change on a crit?",
      }),
      doesExpire: new fields.BooleanField({
        initial: false,
        label: "Override Expiration",
        hint: "Should custom expiration timing be applied?",
      }),
    }),
  });
}

/**
 * Defines the consequence fields for Teriock ability data schema.
 *
 * This function creates schema fields for data that applies to targets at different
 * proficiency levels:
 *
 * - **Base**: Effects applied when using the ability at basic proficiency
 * - **Proficient**: Enhanced effects when proficient with the ability
 * - **Fluent**: Maximum effects when fluent with the ability
 *
 * Each level can have different status effects, damage formulas, drain effects,
 * and property changes applied to targets.
 *
 * @param {object} schema - The base schema object to extend.
 * @returns {object} Schema object with consequence fields added.
 * @private
 *
 * @example
 * // Add consequence fields to a schema.
 * const schema = _defineConsequences(schema);
 */
export function _defineConsequences(schema) {
  schema.applies = new fields.SchemaField({
    base: consequenceField(),
    proficient: consequenceField(),
    fluent: consequenceField(),
    heightened: consequenceField(),
    macros: new fields.TypedObjectField(
      new fields.StringField({
        choices: pseudoHooks,
      }),
    ),
  });
  schema.sustaining = new fields.SetField(
    new fields.DocumentUUIDField({ type: "ActiveEffect" }),
  );
  return schema;
}
