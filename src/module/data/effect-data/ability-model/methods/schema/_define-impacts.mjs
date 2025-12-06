import { pseudoHooks } from "../../../../../constants/system/pseudo-hooks.mjs";
import { FormulaField, RecordField } from "../../../../fields/_module.mjs";
import { builders } from "../../../../fields/helpers/_module.mjs";

const { fields } = foundry.data;

/**
 * Creates a field for impact rolls configuration.
 *
 * Relevant wiki pages:
 * - [Damage types](https://wiki.teriock.com/index.php/Category:Damage_types)
 * - [Drain types](https://wiki.teriock.com/index.php/Category:Drain_types)
 *
 * @returns {RecordField} Field for configuring impact rolls
 * @private
 */
export function impactRollsField() {
  return new RecordField(
    new FormulaField({
      nullable: true,
      deterministic: false,
    }),
    {
      label: "Rolls",
      hint: "The rolls that are made as part of the consequence.",
    },
    undefined,
  );
}

/**
 * Creates a field for impact changes configuration.
 * @returns {ArrayField} Field for configuring impact changes
 * @private
 */
export function impactChangesField() {
  return new fields.ArrayField(builders.changeField(), {
    label: "Changes",
    hint: "Changes made to the target actor as part of the ability's ongoing effect.",
  });
}

/**
 * Creates a field for ability-specific expiration data.
 * @returns {SchemaField}
 */
function impactExpirationField() {
  return new fields.SchemaField({
    combat: new fields.SchemaField({
      who: new fields.SchemaField({
        type: builders.combatExpirationSourceTypeField(),
      }),
      what: builders.combatExpirationMethodField(),
      when: builders.combatExpirationTimingField(),
    }),
  });
}

/**
 * Creates a field for impact data configuration.
 * @returns {SchemaField} Field for configuring impacts data
 */
function abilityImpactField() {
  return new fields.SchemaField({
    changes: impactChangesField(),
    checks: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.tradecrafts,
      }),
      {
        label: "Tradecraft Checks",
        hint: "Tradecraft checks that may be made as part of the ability.",
      },
    ),
    common: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.options.consequence.common,
      }),
      {
        label: "Common Consequences",
        hint: "Common consequences shared by lots of abilities.",
      },
    ),
    duration: new fields.NumberField({
      hint:
        "Increase in the duration (in seconds) of an effect made as part of the ability. If this is nonzero, it " +
        "overrides the default duration.",
      initial: 0,
      label: "Duration",
    }),
    endStatuses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.conditions,
      }),
      {
        label: "Remove Conditions",
        hint:
          "Conditions that may be immediately removed when the ability is used This only works on conditions that " +
          "exist independently of the ability.",
      },
    ),
    expiration: new fields.SchemaField({
      normal: impactExpirationField(),
      crit: impactExpirationField(),
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
    macroButtonUuids: new fields.SetField(
      new fields.DocumentUUIDField({
        type: "Macro",
      }),
      {
        hint:
          "Macros to turn into buttons that are displayed in the chat message rather than automatically executed." +
          " These macros do not have the full roll config in their scope. They are missing ability data, chat data," +
          " and some parameters the use data.",
        initial: [],
        label: "Macro Execution Buttons",
        nullable: false,
        required: false,
      },
    ),
    noTemplate: new fields.BooleanField({
      hint: "Do not place a template when using this ability even if it has an area of effect.",
      initial: false,
      label: "No Template",
      nullable: false,
      required: false,
    }),
    abilityButtonNames: new fields.SetField(new fields.StringField(), {
      hint: "Names of specific abilities that this can cause to be used. These will be displayed as chat buttons.",
      initial: [],
      label: "Ability Use Buttons",
      nullable: false,
      required: false,
    }),
    range: new FormulaField({
      deterministic: true,
    }),
    rolls: impactRollsField(),
    startStatuses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.conditions,
      }),
      {
        label: "Apply Conditions",
        hint:
          "Conditions that may be immediately applied when the ability is used. They exist independently of the " +
          "ability.",
      },
    ),
    statuses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.conditions,
      }),
      {
        label: "Conditions",
        hint:
          "Conditions applied as part of the ability's ongoing effect. These are not applied as separate conditions, " +
          "but merged into an ongoing effect.",
      },
    ),
    critStatuses: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.conditions,
      }),
      {
        label: "Critical Conditions",
        hint:
          "Conditions applied as part of the ability's ongoing effect if it crits. These are not applied as separate" +
          " conditions, but merged into an ongoing effect.",
      },
    ),
    transformation: builders.transformationField({
      configuration: true,
    }),
  });
}

/**
 * Defines the impact fields for ability data schema.
 *
 * This function creates schema fields for data that applies to targets at different
 * proficiency levels:
 *
 * - **Base**: Effects applied when using the ability at basic proficiency
 * - **Proficient**: Enhanced effects when proficient with the ability
 * - **Fluent**: Maximum effects when fluent with the ability
 *
 * @param {object} schema - The base schema object to extend.
 * @returns {object} Schema object with consequence fields added.
 * @private
 */
export function _defineImpacts(schema) {
  schema.impacts = new fields.SchemaField({
    base: abilityImpactField(),
    proficient: abilityImpactField(),
    fluent: abilityImpactField(),
    heightened: abilityImpactField(),
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
