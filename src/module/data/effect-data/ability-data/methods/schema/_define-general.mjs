import { abilityOptions } from "../../../../../constants/ability-options.mjs";
import { conditions } from "../../../../../constants/generated/conditions.mjs";
import { FormulaField, TextField } from "../../../../shared/fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Defines the general fields for Teriock ability data schema.
 *
 * This function creates the core schema fields for ability data, including:
 *
 * **Basic Properties:**
 * - Identification and parent/child relationships
 * - Elder Sorcery configuration
 * - Core ability mechanics (interaction, delivery, targets)
 *
 * **Combat Properties:**
 * - Maneuver types and execution times
 * - Piercing and improvement systems
 * - Range and duration configuration
 *
 * **Ability Types:**
 * - Skill, spell, standard, ritual classifications
 * - Basic abilities and special types
 * - Class associations and rotator abilities
 *
 * **Costs and Effects:**
 * - MP and HP cost systems (static, formula, variable)
 * - Component costs (verbal, somatic, material)
 * - Effect arrays and expansion mechanics
 *
 * **Text Content:**
 * - Overview text for different proficiency levels
 * - Results text for various outcomes
 * - Requirements, limitations, and improvements
 *
 * @param {object} schema - The base schema object to extend
 * @returns {object} Schema object with general ability fields added
 * @private
 *
 * @example
 * // Add general fields to a schema
 * const schema = _defineGeneral({});
 *
 * @example
 * // Use in complete schema definition
 * let schema = {};
 * schema = _defineGeneral(schema);
 */
export function _defineGeneral(schema) {
  return {
    ...schema,
    wikiNamespace: new fields.StringField({ initial: "Ability" }),
    elderSorcery: new fields.BooleanField({
      initial: false,
      label: "Elder Sorcery",
    }),
    elderSorceryIncant: new fields.HTMLField({ initial: "" }),
    powerSources: new fields.ArrayField(
      new fields.StringField({
        choices: abilityOptions.powerSources,
      }),
    ),
    interaction: new fields.StringField({
      initial: "attack",
      choices: abilityOptions.interaction,
    }),
    featSaveAttribute: new fields.StringField({
      initial: "mov",
      choices: abilityOptions.featSaveAttribute,
    }),
    maneuver: new fields.StringField({
      initial: "active",
      choices: abilityOptions.maneuver,
    }),
    executionTime: new fields.StringField({ initial: "a1" }),
    delivery: new fields.SchemaField({
      base: new fields.StringField({
        initial: "weapon",
        choices: abilityOptions.delivery,
      }),
      parent: new fields.StringField({
        initial: null,
        nullable: true,
        choices: abilityOptions.deliveryParent,
      }),
      package: new fields.StringField({
        initial: null,
        nullable: true,
        choices: abilityOptions.deliveryPackage,
      }),
    }),
    targets: new fields.ArrayField(
      new fields.StringField({
        choices: abilityOptions.targets,
      }),
      {
        initial: ["creature"],
      },
    ),
    elements: new fields.ArrayField(
      new fields.StringField({
        choices: abilityOptions.elements,
      }),
    ),
    duration: new fields.SchemaField({
      unit: new fields.StringField({
        choices: abilityOptions.duration.unit,
        initial: "minute",
        label: "Unit",
        hint: "Unit of time for this ability's duration.",
      }),
      quantity: new fields.NumberField({
        initial: 1,
        min: 0,
        label: "Quantity",
        hint: 'How many of the aforementioned unit should this unit be active for? Irrelevant for "Instant" and "No Limit" units.',
      }),
      conditions: new fields.SchemaField({
        present: new fields.SetField(
          new fields.StringField({ choices: conditions }),
          {
            label: "Present Conditions",
            hint: "What conditions must be present in order for this ability to be active?",
          },
        ),
        absent: new fields.SetField(
          new fields.StringField({ choices: conditions }),
          {
            label: "Absent Conditions",
            hint: "What conditions must be absent in order for this ability to be active?",
          },
        ),
      }),
      stationary: new fields.BooleanField({
        label: "Stationary",
        hint: "Do you need to be stationary for this ability to be active?",
      }),
      description: new fields.StringField({
        label: "Description",
        hint: "Custom description. Leave blank in order for the duration to be automatically generated.",
        initial: "1 Minute",
      }),
    }),
    sustained: new fields.BooleanField({
      initial: false,
      label: "Sustained",
    }),
    range: new fields.StringField({ initial: null, nullable: true }),
    overview: new fields.SchemaField({
      base: new TextField({ initial: "", label: "Description" }),
      proficient: new TextField({ initial: "", label: "If Proficient" }),
      fluent: new TextField({ initial: "", label: "If Fluent" }),
    }),
    results: new fields.SchemaField({
      hit: new TextField({ initial: "", label: "On Hit" }),
      critHit: new TextField({ initial: "", label: "On Critical Hit" }),
      miss: new TextField({ initial: "", label: "On Miss" }),
      critMiss: new TextField({ initial: "", label: "On Critical Miss" }),
      save: new TextField({ initial: "", label: "On Success" }),
      critSave: new TextField({ initial: "", label: "On Critical Success" }),
      fail: new TextField({ initial: "", label: "On Fail" }),
      critFail: new TextField({ initial: "", label: "On Critical Fail" }),
    }),
    piercing: new fields.StringField({
      initial: "normal",
      choices: abilityOptions.piercing,
    }),
    improvements: new fields.SchemaField({
      attributeImprovement: new fields.SchemaField({
        attribute: new fields.StringField({
          initial: null,
          nullable: true,
          choices: abilityOptions.attribute,
        }),
        minVal: new fields.NumberField({ initial: 0 }),
      }),
      featSaveImprovement: new fields.SchemaField({
        attribute: new fields.StringField({
          initial: null,
          nullable: true,
          choices: abilityOptions.featSaveAttribute,
        }),
        amount: new fields.StringField({ initial: "proficient" }),
      }),
    }),
    skill: new fields.BooleanField({
      initial: false,
      label: "Skill",
    }),
    spell: new fields.BooleanField({
      initial: false,
      label: "Spell",
    }),
    standard: new fields.BooleanField({
      initial: false,
      label: "Standard",
    }),
    ritual: new fields.BooleanField({
      initial: false,
      label: "Ritual",
    }),
    class: new fields.StringField({ initial: "" }),
    rotator: new fields.BooleanField({
      initial: false,
      label: "Rotator",
    }),
    invoked: new fields.BooleanField({
      initial: false,
      label: "Invoked",
    }),
    costs: new fields.SchemaField({
      verbal: new fields.BooleanField({
        initial: false,
        label: "Verbal",
      }),
      somatic: new fields.BooleanField({
        initial: false,
        label: "Somatic",
      }),
      material: new fields.BooleanField({
        initial: false,
        label: "Material",
      }),
      mp: new fields.SchemaField({
        type: new fields.StringField({
          initial: "none",
          choices: {
            none: "None",
            static: "Static",
            formula: "Formula",
            variable: "Variable",
          },
        }),
        value: new fields.SchemaField({
          static: new fields.NumberField({
            initial: 0,
            integer: true,
            min: 0,
          }),
          formula: new FormulaField({ initial: "", deterministic: false }),
          variable: new TextField({ initial: "", label: "Mana Cost" }),
        }),
      }),
      hp: new fields.SchemaField({
        type: new fields.StringField({
          initial: "none",
          choices: {
            none: "None",
            static: "Static",
            formula: "Formula",
            variable: "Variable",
            hack: "Hack",
          },
        }),
        value: new fields.SchemaField({
          static: new fields.NumberField({
            initial: 0,
            integer: true,
            min: 0,
          }),
          formula: new FormulaField({ initial: "", deterministic: false }),
          variable: new TextField({ initial: "", label: "Hit Cost" }),
        }),
      }),
      gp: new fields.SchemaField({
        type: new fields.StringField({
          initial: "none",
          choices: {
            none: "None",
            static: "Static",
            formula: "Formula",
            variable: "Variable",
          },
        }),
        value: new fields.SchemaField({
          static: new fields.NumberField({
            initial: 0,
            integer: true,
            min: 0,
          }),
          formula: new FormulaField({ initial: "", deterministic: false }),
          variable: new TextField({ initial: "", label: "Gold Cost" }),
        }),
      }),
      break: new fields.StringField({ initial: "" }),
      materialCost: new TextField({ initial: "", label: "Material Cost" }),
    }),
    heightened: new TextField({ initial: "", label: "Heightened" }),
    endCondition: new TextField({ initial: "", label: "End Condition" }),
    requirements: new TextField({ initial: "", label: "Requirements" }),
    effects: new fields.ArrayField(
      new fields.StringField({
        choices: abilityOptions.effects,
      }),
    ),
    expansion: new fields.StringField({ initial: null, nullable: true }),
    expansionRange: new fields.StringField({ initial: null, nullable: true }),
    expansionSaveAttribute: new fields.StringField({ initial: "mov" }),
    trigger: new TextField({ initial: "", label: "Trigger" }),
    basic: new fields.BooleanField({
      initial: false,
      label: "Basic",
    }),
    form: new fields.StringField({ initial: "normal" }),
    limitation: new TextField({ initial: "", label: "Limitation" }),
    improvement: new TextField({ initial: "", label: "Improvement" }),
    prepared: new fields.BooleanField({
      initial: true,
      label: "Prepared",
    }),
    warded: new fields.BooleanField({
      initial: false,
      label: "Warded",
    }),
    secret: new fields.BooleanField({
      initial: false,
      label: "Secret",
    }),
    gifted: new fields.SchemaField({
      enabled: new fields.BooleanField({ label: "Gifted" }),
      amount: new fields.NumberField({ initial: 1, min: 1, integer: true }),
    }),
  };
}
