import {
  TeriockArrayField,
  TeriockRecordField,
} from "./_fields.mjs"
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
 * // Create rolls field
 * const rollsField = consequenceRollsField();
 */
export function consequenceRollsField() {
  return new TeriockRecordField(
    new fields.StringField({
      nullable: true,
    }),
    {
      label: "Rolls",
      hint: "The rolls that are made as part of the consequence.",
    },
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
      hint: "The changes applied as part of the ongoing effect. These are applied to the target.",
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
  return new fields.SchemaField({
    statuses: new fields.SetField(
      new fields.StringField({
        choices: CONFIG.TERIOCK.conditions,
      }),
      {
        label: "Conditions",
        hint: "The conditions applied as part of the ability's ongoing effect.",
      },
    ),
    startStatuses: new fields.SetField(
      new fields.StringField({
        choices: CONFIG.TERIOCK.conditions,
      }),
      {
        label: "Start Conditions",
        hint: "These conditions are immediately applied when the ability is used. They exist independently of the ability.",
      },
    ),
    endStatuses: new fields.SetField(
      new fields.StringField({
        choices: CONFIG.TERIOCK.conditions,
      }),
      {
        label: "End Conditions",
        hint: "These conditions are immediately removed when the ability is used.",
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
        hint: "The types of hack damage that can be applied.",
      },
    ),
    duration: new fields.NumberField({ initial: 0 }),
    changes: consequenceChangesField(),
  });
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
  });

  return schema;
}
