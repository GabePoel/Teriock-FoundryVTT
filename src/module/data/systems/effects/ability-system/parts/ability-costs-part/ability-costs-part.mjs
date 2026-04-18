import { costOptions } from "../../../../../../constants/options/cost-options.mjs";
import { localizeChoices } from "../../../../../../helpers/localization.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { FormulaField, TextField } from "../../../../../fields/_module.mjs";

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
     * @extends {Teriock.Models.AbilityCostsPartData}
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
                const label = _loc("TERIOCK.COSTS.Long.primary", {
                  key: _loc(v.label),
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
                const label = _loc("TERIOCK.COSTS.Long.component", {
                  key: _loc(v),
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
                    initial: 0,
                    integer: true,
                    label: v.label,
                    min: 0,
                    nullable: false,
                  }),
              ),
            ),
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        // 2025-12-18 HP and MP point cost migration
        for (const pointCost of ["mp", "hp"]) {
          if (source.costs) {
            if (source.costs[pointCost] === null) {
              source.costs[pointCost] = {
                type: "none",
                value: {
                  static: 0,
                  formula: "",
                  variable: "",
                },
              };
            }
            if (typeof source.costs[pointCost] == "string") {
              const variableCost = String(
                pointCost === "mp" ? "manaCost" : "hitCost",
              );
              source.costs[pointCost] = {
                type: "variable",
                value: {
                  static: 0,
                  formula: "",
                  variable: variableCost || "",
                },
              };
            }
            if (typeof source.costs[pointCost] == "number") {
              source.costs[pointCost] = {
                type: "static",
                value: {
                  static: Number(source.costs[pointCost]),
                  formula: "",
                  variable: "",
                },
              };
            }
            if (typeof source.costs[pointCost]?.value == "number") {
              source.costs[pointCost] = {
                type: "static",
                value: {
                  static: source.costs[pointCost].value,
                  formula: "",
                  variable: "",
                },
              };
            }
            if (typeof source.costs[pointCost]?.value == "string") {
              source.costs[pointCost] = {
                type: "variable",
                value: {
                  static: 0,
                  formula: "",
                  variable: String(source.costs[pointCost].value),
                },
              };
            }
          }
        }
        return super.migrateData(source, options, state);
      }

      /**
       * Cost wrappers.
       * @returns {string[]}
       */
      get _costWrappers() {
        return [
          ...Object.entries(TERIOCK.options.cost.primary.keys).map(([k, v]) =>
            this.costs.primary[k].type === "formula"
              ? _loc("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
                  value: this.costs.primary[k].formula,
                  cost: v.abbreviation,
                })
              : this.costs.primary[k].type === "description"
                ? _loc("TERIOCK.SYSTEMS.Ability.PANELS.variable", {
                    cost: v.abbreviation,
                  })
                : "",
          ),
          ...Object.entries(TERIOCK.options.cost.components.keys).map(
            ([k, v]) => (this.costs.components[k].type ? v : ""),
          ),
        ];
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
