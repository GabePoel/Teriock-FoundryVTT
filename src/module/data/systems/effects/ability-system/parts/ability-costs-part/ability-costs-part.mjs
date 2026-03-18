import { costOptions } from "../../../../../../constants/options/cost-options.mjs";
import { localizeChoices } from "../../../../../../helpers/localization.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { FormulaField, TextField } from "../../../../../fields/_module.mjs";

const { hasProperty, getProperty, setProperty, deleteProperty } = foundry.utils;
const { fields } = foundry.data;

/**
 * Ability costs part.
 *
 * Relevant wiki pages:
 * - [Costs](https://wiki.teriock.com/index.php/Core:Costs)
 *
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityCostsPartInterface}
     * @mixin
     */
    class AbilityCostsPart extends Base {
      /** @inheritDoc */
      static PRESERVED_PROPERTIES = [
        "system.costs.tweaks",
        ...super.PRESERVED_PROPERTIES,
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          costs: new fields.SchemaField({
            primary: new fields.SchemaField(
              objectMap(costOptions.primary.keys, (v) => {
                const label = game.i18n.format("TERIOCK.COSTS.Long.primary", {
                  key: game.i18n.localize(v.label),
                });
                return new fields.SchemaField(
                  {
                    description: new TextField({ label }),
                    formula: new FormulaField({ label, deterministic: false }),
                    type: new fields.StringField({
                      choices: localizeChoices(costOptions.primary.types),
                      initial: null,
                      label,
                      nullable: true,
                    }),
                  },
                  { label },
                );
              }),
            ),
            components: new fields.SchemaField(
              objectMap(costOptions.components.keys, (v) => {
                const label = game.i18n.format("TERIOCK.COSTS.Long.component", {
                  key: game.i18n.localize(v),
                });
                return new fields.SchemaField(
                  {
                    description: new TextField({ label }),
                    type: new fields.StringField({
                      choices: localizeChoices(costOptions.components.types),
                      initial: null,
                      label,
                      nullable: true,
                    }),
                  },
                  { label },
                );
              }),
            ),
            tweaks: new fields.SchemaField(
              objectMap(
                costOptions.tweaks,
                (v) =>
                  new fields.NumberField({
                    label: v.label,
                    initial: 0,
                    integer: true,
                    min: 0,
                  }),
              ),
            ),
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(data) {
        // 2025-12-18 HP and MP point cost migration
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

        // 2026-03-17 Unified cost migration
        if (getProperty(data, "costs.hp.type") === "hack") {
          setProperty(data, "costs.components.hack.type", "tag");
        }
        for (const stat of ["hp", "mp", "gp"]) {
          if (hasProperty(data, `costs.${stat}`)) {
            if (getProperty(data, `costs.${stat}.type`) === "variable") {
              setProperty(data, `costs.primary.${stat}.type`, "description");
              setProperty(
                data,
                `costs.primary.${stat}.description`,
                getProperty(data, `costs.${stat}.value.variable`),
              );
            } else if (getProperty(data, `costs.${stat}.type`) === "static") {
              setProperty(data, `costs.primary.${stat}.type`, "formula");
              setProperty(
                data,
                `costs.primary.${stat}.formula`,
                getProperty(data, `costs.${stat}.value.static`).toString(),
              );
            } else if (getProperty(data, `costs.${stat}.type`) === "formula") {
              setProperty(data, `costs.primary.${stat}.type`, "formula");
              setProperty(
                data,
                `costs.primary.${stat}.formula`,
                getProperty(data, `costs.${stat}.value.formula`),
              );
            } else {
              setProperty(data, `costs.${stat}.type`, null);
            }
            deleteProperty(`costs.${stat}`);
          }
        }
        for (const component of ["material", "somatic", "verbal"]) {
          if (getProperty(data, `costs.${component}`)) {
            setProperty(data, `costs.components.${component}.type`, "tag");
          }
          deleteProperty(`costs.${component}`);
        }
        if (getProperty(data, "costs.materialCost")) {
          setProperty(data, "costs.components.material.type", "description");
          setProperty(
            data,
            "costs.components.material.description",
            getProperty(data, "costs.materialCost"),
          );
        }
        deleteProperty(data, "costs.materialCost");
        if (getProperty(data, "costs.break") === "shatter") {
          setProperty(data, "costs.components.break.type", "description");
          setProperty(
            data,
            "costs.components.break.description",
            "When [[lookup name]] is used, the item that delivers it becomes @L[Property:Shattered]{shattered}.",
          );
        } else if (getProperty(data, "costs.break") === "destroy") {
          setProperty(data, "costs.components.break.type", "description");
          setProperty(
            data,
            "costs.components.break.description",
            "When [[lookup name]] is used, the item that delivers it becomes @L[Property:Destroyed]{destroyed}.",
          );
        }
        for (const tweak of ["adept", "gifted"]) {
          if (
            getProperty(data, `${tweak}.enabled`) &&
            getProperty(data, `${tweak}.amount`)
          ) {
            setProperty(
              data,
              `costs.tweaks.${tweak}`,
              getProperty(data, `${tweak}.amount`),
            );
            deleteProperty(data, tweak);
          }
        }
        super.migrateData(data);
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
          ...Object.fromEntries(
            Object.entries(this.costs.tweaks).map(([k, v]) => [
              `tweaks.${k}`,
              v,
            ]),
          ),
          ...Object.fromEntries(
            Object.entries(this.costs.components).map(([k, v]) => [
              `components.${k}`,
              Number(v.type),
            ]),
          ),
          ...Object.fromEntries(
            Object.entries(this.costs.primary).map(([k, v]) => [
              `costs.${k}`,
              v.type === "formula"
                ? v.formula
                : v.type === "description"
                  ? "x"
                  : 0,
            ]),
          ),
        });
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce invoked costs
        if (this.invoked) {
          if (!this.costs.components.somatic.type) {
            this.costs.components.somatic.type = "tag";
          }
          if (!this.costs.components.verbal.type) {
            this.costs.components.verbal.type = "tag";
          }
        }
      }
    }
  );
};
