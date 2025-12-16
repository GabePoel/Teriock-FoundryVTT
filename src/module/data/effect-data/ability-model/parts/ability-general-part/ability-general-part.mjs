import { FormulaField, TextField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability general part.
 * @param {typeof TeriockAbilityModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockAbilityModel}
     * @implements {AbilityGeneralPartInterface}
     * @mixin
     */
    class AbilityGeneralPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
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
          class: new fields.StringField({
            choices: TERIOCK.options.ability.class,
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
          grantOnlyText: new TextField({
            initial: "",
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
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        // Effect key migration
        if (data.effects?.includes("truth")) {
          data.effects = data.effects.map((effect) =>
            effect === "truth" ? "truthDetecting" : effect,
          );
        }
        if (data.effects?.includes("duelMod")) {
          data.effects = data.effects.map((effect) =>
            effect === "duelMod" ? "duelModifying" : effect,
          );
        }

        // HP and MP cost migration
        for (const pointCost of ["mp", "hp"]) {
          if (data.costs) {
            if (data.costs[pointCost] === null) {
              data.costs[pointCost] = {
                type: "none",
                value: {
                  static: 0,
                  formula: "",
                  variable: "",
                },
              };
            }
            if (typeof data.costs[pointCost] == "string") {
              const variableCost = String(
                pointCost === "mp" ? "manaCost" : "hitCost",
              );
              data.costs[pointCost] = {
                type: "variable",
                value: {
                  static: 0,
                  formula: "",
                  variable: variableCost || "",
                },
              };
            }
            if (typeof data.costs[pointCost] == "number") {
              data.costs[pointCost] = {
                type: "static",
                value: {
                  static: Number(data.costs[pointCost]),
                  formula: "",
                  variable: "",
                },
              };
            }
            if (typeof data.costs[pointCost]?.value == "number") {
              data.costs[pointCost] = {
                type: "static",
                value: {
                  static: data.costs[pointCost].value,
                  formula: "",
                  variable: "",
                },
              };
            }
            if (typeof data.costs[pointCost]?.value == "string") {
              data.costs[pointCost] = {
                type: "variable",
                value: {
                  static: 0,
                  formula: "",
                  variable: String(data.costs[pointCost].value),
                },
              };
            }
          }
        }

        // Form migration
        if (foundry.utils.getProperty(data, "abilityType")) {
          foundry.utils.setProperty(
            data,
            "form",
            foundry.utils.getProperty(data, "abilityType"),
          );
        }

        // Effect types migration
        if (data.effects) {
          data.effectTypes = data.effects;
          delete data.effects;
        }

        super.migrateData(data);
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce invoked costs
        if (this.invoked) {
          this.costs.somatic = true;
          this.costs.verbal = true;
        }

        // Enforce power sources
        for (const ps of this.powerSources) {
          if (
            Object.keys(TERIOCK.index.effectTypes).includes(ps) &&
            !this.effectTypes.has(ps)
          ) {
            this.effectTypes.add(ps);
          }
        }

        // Add granting text
        if (this.grantOnly) {
          this.grantOnlyText = `This ability can only be used with @UUID[${this.parent.parent.uuid}].`;
        } else {
          this.grantOnlyText = "";
        }
      }
    }
  );
};
