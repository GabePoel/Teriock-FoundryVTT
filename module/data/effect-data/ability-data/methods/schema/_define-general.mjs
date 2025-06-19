const { fields } = foundry.data;
import { abilityOptions } from "../../../../../helpers/constants/ability-options.mjs";

export function _defineGeneral(schema) {
  return {
    ...schema,
    wikiNamespace: new fields.StringField({ initial: "Ability" }),
    parentId: new fields.DocumentIdField({
      initial: null,
      nullable: true,
    }),
    childIds: new fields.ArrayField(new fields.DocumentIdField()),
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
    ),
    elements: new fields.ArrayField(
      new fields.StringField({
        choices: abilityOptions.elements,
      }),
    ),
    duration: new fields.StringField({ initial: "Instant" }),
    sustained: new fields.BooleanField({
      initial: false,
      label: "Sustained",
    }),
    range: new fields.StringField({ initial: null, nullable: true }),
    overview: new fields.SchemaField({
      base: new fields.HTMLField({ initial: "" }),
      proficient: new fields.HTMLField({ initial: "" }),
      fluent: new fields.HTMLField({ initial: "" }),
    }),
    results: new fields.SchemaField({
      hit: new fields.HTMLField({ initial: "" }),
      critHit: new fields.HTMLField({ initial: "" }),
      miss: new fields.HTMLField({ initial: "" }),
      critMiss: new fields.HTMLField({ initial: "" }),
      save: new fields.HTMLField({ initial: "" }),
      critSave: new fields.HTMLField({ initial: "" }),
      fail: new fields.HTMLField({ initial: "" }),
      critFail: new fields.HTMLField({ initial: "" }),
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
          formula: new fields.StringField({ initial: "" }),
          variable: new fields.HTMLField({ initial: "" }),
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
          formula: new fields.StringField({ initial: "" }),
          variable: new fields.HTMLField({ initial: "" }),
        }),
      }),
      break: new fields.StringField({ initial: "" }),
      materialCost: new fields.HTMLField({ initial: "" }),
    }),
    heightened: new fields.HTMLField({ initial: "" }),
    endCondition: new fields.HTMLField({ initial: "" }),
    requirements: new fields.HTMLField({ initial: "" }),
    effects: new fields.ArrayField(
      new fields.StringField({
        choices: abilityOptions.effects,
      }),
    ),
    expansion: new fields.StringField({ initial: null, nullable: true }),
    expansionRange: new fields.StringField({ initial: null, nullable: true }),
    expansionSaveAttribute: new fields.StringField({ initial: "mov" }),
    trigger: new fields.HTMLField({ initial: "" }),
    basic: new fields.BooleanField({
      initial: false,
      label: "Basic",
    }),
    abilityType: new fields.StringField({ initial: "normal" }),
    limitation: new fields.HTMLField({ initial: "" }),
    improvement: new fields.HTMLField({ initial: "" }),
  };
}
