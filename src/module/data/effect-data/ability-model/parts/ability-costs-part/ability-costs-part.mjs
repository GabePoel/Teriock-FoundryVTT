import { TextField } from "../../../../fields/_module.mjs";
import {
  costAdjustment,
  costField,
} from "../../../../fields/helpers/builders.mjs";

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
          adept: costAdjustment("Adept"),
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
            mp: costField({ label: "Mana Cost" }),
            hp: costField({
              label: "Hit Cost",
              extraChoices: { hack: "Hack" },
            }),
            gp: costField({ label: "Gold Cost" }),
            break: new fields.StringField({ initial: "" }),
            materialCost: new TextField({
              initial: "",
              label: "Material Cost",
            }),
          }),
          gifted: costAdjustment("Gifted"),
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
          adept: Number(this.adept.enabled),
          "adept.amount": this.adept.enabled ? this.adept.amount : 0,
          gifted: Number(this.gifted.enabled),
          "gifted.amount": this.gifted.enabled ? this.gifted.amount : 0,
          "costs.ver": Number(this.costs.verbal),
          "costs.som": Number(this.costs.somatic),
          "costs.mat": Number(this.costs.material),
        });
        // Add cost values
        for (const c of ["gp", "hp", "mp"]) {
          const cost = this.costs[c];
          if (["static", "formula"].includes(cost.type)) {
            data[`costs.${c}`] = cost.value[cost.type];
          }
        }
        return data;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce cost values
        for (const c of ["gp", "hp", "mp"]) {
          const cost = this.costs[c];
          const defaultValue = {
            formula: "",
            static: 0,
            variable: "",
          };
          delete defaultValue[cost.type];
          Object.assign(cost.value, defaultValue);
        }

        // Enforce invoked costs
        if (this.invoked) {
          this.costs.somatic = true;
          this.costs.verbal = true;
        }
      }
    }
  );
};
