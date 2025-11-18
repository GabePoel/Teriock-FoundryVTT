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
 */
export function _defineGeneral(schema) {
  return {
    ...schema,
    adept: new fields.SchemaField({
      enabled: new fields.BooleanField({ label: "Adept" }),
      amount: new fields.NumberField({
        initial: 1,
        min: 1,
        integer: true,
      }),
    }),
    basic: new fields.BooleanField({
      initial: false,
      label: "Basic",
    }),
    class: new fields.StringField({ choices: TERIOCK.options.ability.class }),
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
          formula: new FormulaField({
            initial: "",
            deterministic: false,
          }),
          variable: new TextField({
            initial: "",
            label: "Mana Cost",
          }),
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
          formula: new FormulaField({
            initial: "",
            deterministic: false,
          }),
          variable: new TextField({
            initial: "",
            label: "Hit Cost",
          }),
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
          formula: new FormulaField({
            initial: "",
            deterministic: false,
          }),
          variable: new TextField({
            initial: "",
            label: "Gold Cost",
          }),
        }),
      }),
      break: new fields.StringField({ initial: "" }),
      materialCost: new TextField({
        initial: "",
        label: "Material Cost",
      }),
    }),
    delivery: new fields.SchemaField({
      base: new fields.StringField({
        initial: "weapon",
        choices: TERIOCK.options.ability.delivery,
      }),
      parent: new fields.StringField({
        initial: null,
        nullable: true,
        choices: TERIOCK.options.ability.deliveryParent,
      }),
      package: new fields.StringField({
        initial: null,
        nullable: true,
        choices: TERIOCK.options.ability.deliveryPackage,
      }),
    }),
    duration: new fields.SchemaField({
      unit: new fields.StringField({
        choices: TERIOCK.options.ability.duration.unit,
        initial: "minute",
        label: "Unit",
        hint: "Unit of time for this ability's duration.",
      }),
      quantity: new fields.NumberField({
        initial: 1,
        min: 0,
        label: "Quantity",
        hint:
          'How many of the aforementioned unit should this unit be active for? Irrelevant for "Instant" and "No ' +
          'Limit" units.',
      }),
      conditions: new fields.SchemaField({
        present: new fields.SetField(
          new fields.StringField({ choices: TERIOCK.index.conditions }),
          {
            label: "Present Conditions",
            hint: "What conditions must be present in order for this ability to be active?",
          },
        ),
        absent: new fields.SetField(
          new fields.StringField({ choices: TERIOCK.index.conditions }),
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
    effectTypes: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.effectTypes,
      }),
    ),
    elderSorcery: new fields.BooleanField({
      initial: false,
      label: "Elder Sorcery",
    }),
    elderSorceryIncant: new TextField({
      initial: "",
      label: "With Elder Sorcery...",
    }),
    elements: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.elements,
      }),
    ),
    endCondition: new TextField({
      initial: "",
      label: "End Condition",
    }),
    executionTime: new fields.StringField({ initial: "a1" }),
    expansion: new fields.StringField({
      initial: null,
      nullable: true,
    }),
    expansionRange: new fields.StringField({
      initial: null,
      nullable: true,
    }),
    expansionSaveAttribute: new fields.StringField({ initial: "mov" }),
    featSaveAttribute: new fields.StringField({
      initial: "mov",
      choices: TERIOCK.index.attributes,
    }),
    form: new fields.StringField({ initial: "normal" }),
    gifted: new fields.SchemaField({
      enabled: new fields.BooleanField({ label: "Gifted" }),
      amount: new fields.NumberField({
        initial: 1,
        min: 1,
        integer: true,
      }),
    }),
    grantOnly: new fields.BooleanField({
      initial: false,
      label: "Granter Only",
    }),
    heightened: new TextField({
      initial: "",
      label: "Heightened",
    }),
    improvement: new TextField({
      initial: "",
      label: "Improvement",
    }),
    improvements: new fields.SchemaField({
      attributeImprovement: new fields.SchemaField({
        attribute: new fields.StringField({
          initial: null,
          nullable: true,
          choices: TERIOCK.index.statAttributes,
        }),
        minVal: new fields.NumberField({ initial: 0 }),
        text: new TextField({
          initial: "",
          label: "Attribute Improvement",
        }),
      }),
      featSaveImprovement: new fields.SchemaField({
        attribute: new fields.StringField({
          initial: null,
          nullable: true,
          choices: TERIOCK.index.attributes,
        }),
        amount: new fields.StringField({ initial: "proficient" }),
        text: new TextField({
          initial: "",
          label: "Feat Save Improvement",
        }),
      }),
    }),
    interaction: new fields.StringField({
      initial: "attack",
      choices: TERIOCK.options.ability.interaction,
    }),
    invoked: new fields.BooleanField({
      initial: false,
      label: "Invoked",
    }),
    limitation: new TextField({
      initial: "",
      label: "Limitation",
    }),
    maneuver: new fields.StringField({
      initial: "active",
      choices: TERIOCK.options.ability.maneuver,
    }),
    overview: new fields.SchemaField({
      base: new TextField({
        initial: "",
        label: "Description",
      }),
      proficient: new TextField({
        initial: "",
        label: "If Proficient",
      }),
      fluent: new TextField({
        initial: "",
        label: "If Fluent",
      }),
    }),
    piercing: new fields.StringField({
      initial: "normal",
      choices: TERIOCK.options.ability.piercing,
    }),
    powerSources: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.index.powerSources,
      }),
    ),
    prepared: new fields.BooleanField({
      initial: true,
      label: "Prepared",
    }),
    range: new fields.StringField({
      initial: null,
      nullable: true,
    }),
    requirements: new TextField({
      initial: "",
      label: "Requirements",
    }),
    results: new fields.SchemaField({
      hit: new TextField({
        initial: "",
        label: "On Hit",
      }),
      critHit: new TextField({
        initial: "",
        label: "On Critical Hit",
      }),
      miss: new TextField({
        initial: "",
        label: "On Miss",
      }),
      critMiss: new TextField({
        initial: "",
        label: "On Critical Miss",
      }),
      save: new TextField({
        initial: "",
        label: "On Success",
      }),
      critSave: new TextField({
        initial: "",
        label: "On Critical Success",
      }),
      fail: new TextField({
        initial: "",
        label: "On Fail",
      }),
      critFail: new TextField({
        initial: "",
        label: "On Critical Fail",
      }),
    }),
    ritual: new fields.BooleanField({
      initial: false,
      label: "Ritual",
    }),
    rotator: new fields.BooleanField({
      initial: false,
      label: "Rotator",
    }),
    secret: new fields.BooleanField({
      initial: false,
      label: "Secret",
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
    sustained: new fields.BooleanField({
      initial: false,
      label: "Sustained",
    }),
    targets: new fields.SetField(
      new fields.StringField({
        choices: TERIOCK.options.ability.targets,
      }),
      {
        initial: ["creature"],
      },
    ),
    trigger: new TextField({
      initial: "",
      label: "Trigger",
    }),
    warded: new fields.BooleanField({
      initial: false,
      label: "Warded",
    }),
  };
}
