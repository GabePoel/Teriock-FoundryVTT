import { FormulaField, TextField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability costs part.
 * @param {typeof TeriockAbilityModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockAbilityModel}
     * @implements {AbilityCostsPartInterface}
     * @mixin
     */
    class AbilityCostsPart extends Base {
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
          gifted: new fields.SchemaField({
            enabled: new fields.BooleanField({ label: "Gifted" }),
            amount: new fields.NumberField({
              initial: 1,
              min: 1,
              integer: true,
            }),
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
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

        super.migrateData(data);
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          adept: this.adept.enabled ? 1 : 0,
          "adept.amount": this.adept.enabled ? this.adept.amount : 0,
          gifted: this.gifted.enabled ? 1 : 0,
          "gifted.amount": this.gifted.enabled ? this.gifted.amount : 0,
          "costs.ver": this.costs.verbal ? 1 : 0,
          "costs.som": this.costs.somatic ? 1 : 0,
          "costs.mat": this.costs.material ? 1 : 0,
        });
        // Add cost values
        if (this.costs.mp.type === "static") {
          data["costs.mp"] = this.costs.mp.value.static;
        } else if (this.costs.mp.type === "formula") {
          data["costs.mp"] = this.costs.mp.value.formula;
        }
        if (this.costs.hp.type === "static") {
          data["costs.hp"] = this.costs.hp.value.static;
        } else if (this.costs.hp.type === "formula") {
          data["costs.hp"] = this.costs.hp.value.formula;
        }
        if (this.costs.gp.type === "static") {
          data["costs.gp"] = this.costs.gp.value.static;
        } else if (this.costs.gp.type === "formula") {
          data["costs.gp"] = this.costs.gp.value.formula;
        }
        return data;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce invoked costs
        if (this.invoked) {
          this.costs.somatic = true;
          this.costs.verbal = true;
        }
      }
    }
  );
};
