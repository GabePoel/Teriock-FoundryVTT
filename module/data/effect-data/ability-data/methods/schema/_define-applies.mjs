const { fields } = foundry.data;
import { tradecraftOptions } from "../../../../../helpers/constants/tradecraft-options.mjs";
import { mergeLevel } from "../../../../../helpers/utils.mjs";
import { TeriockArrayField, TeriockRecordField } from "../../../../shared/fields.mjs";

const tradecrafts = mergeLevel(tradecraftOptions, "*", "tradecrafts");

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
 * // Create rolls field
 * const rollsField = consequenceRollsField();
 */
export function consequenceRollsField() {
  return new TeriockRecordField(
    /** @type {typeof StringField} */
    new fields.StringField({
      nullable: true,
    }),
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
    /** @type {typeof SchemaField} */
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
 * Creates a field for applies data configuration.
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
function appliesField() {
  return new fields.SchemaField(
    /** @type {typeof DataField} */ {
      statuses: new fields.SetField(
        /** @type {typeof StringField} */
        new fields.StringField({
          choices: CONFIG.TERIOCK.conditions,
        }),
        {
          label: "Conditions",
          hint: "Conditions applied as part of the ability's ongoing effect. These are not applied as separate conditions, but merged into an ongoing effect.",
        },
      ),
      startStatuses: new fields.SetField(
        /** @type {typeof StringField} */
        new fields.StringField({
          choices: CONFIG.TERIOCK.conditions,
        }),
        {
          label: "Apply Conditions",
          hint: "Conditions that may be immediately applied when the ability is used. They exist independently of the ability.",
        },
      ),
      endStatuses: new fields.SetField(
        /** @type {typeof StringField} */
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
        /** @type {typeof StringField} */
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
        /** @type {typeof StringField} */
        new fields.StringField({
          choices: tradecrafts,
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
    },
  );
}

/**
 * Defines the applies fields for Teriock ability data schema.
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
 * @param {object} schema - The base schema object to extend
 * @returns {object} Schema object with applies fields added
 * @private
 *
 * @example
 * // Add applies fields to a schema
 * const schema = _defineApplies({});
 *
 * @example
 * // Use in complete schema definition
 * let schema = {};
 * schema = _defineApplies(schema);
 * schema = _defineGeneral(schema);
 */
export function _defineApplies(schema) {
  schema.applies = new fields.SchemaField({
    base: appliesField(),
    proficient: appliesField(),
    fluent: appliesField(),
    heightened: appliesField(),
    macro: new fields.DocumentUUIDField({
      nullable: true,
      initial: null,
      label: "Custom Macro",
      hint: "Custom macro that executes instead of any of the default application options.",
      type: "Macro",
    }),
  });

  return schema;
}
