import costConfig from "../../../../../../constants/config/cost-config.mjs";
import statConfig from "../../../../../../constants/config/stat-config.mjs";
import { localizeChoices } from "../../../../../../helpers/localization.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { FormulaField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability costs part.
 *
 * Relevant wiki pages:
 * - [Costs](https://wiki.teriock.com/index.php/Core:Costs)
 *
 * @param {typeof AbilitySystem} Base
 */
export default function AbilityCostsPart(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityCostsPartData}
     * @mixin
     */
    class AbilityCostsPart extends Base {
      /** @inheritDoc */
      static PRESERVED_PROPERTIES = ["system.costs.tweaks", ...super.PRESERVED_PROPERTIES];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          costs: new fields.SchemaField({
            components: new fields.SchemaField(objectMap(costConfig.components.keys, v => {
              const label = _loc("TERIOCK.COSTS.Long.component", { key: _loc(v) });
              return new fields.SchemaField({
                description: new fields.HTMLField({ label }),
                type: new fields.StringField({
                  choices: localizeChoices(costConfig.components.types),
                  initial: null,
                  label,
                  nullable: true,
                }),
              }, { label });
            })),
            primary: new fields.SchemaField(objectMap(statConfig, v => {
              const label = _loc("TERIOCK.COSTS.Long.primary", { key: _loc(v.label) });
              return new fields.SchemaField({
                description: new fields.HTMLField({ label }),
                formula: new FormulaField({ deterministic: false, initial: "0", label }),
                type: new fields.StringField({
                  choices: localizeChoices(costConfig.primary.types),
                  initial: null,
                  label,
                  nullable: true,
                }),
              }, { label });
            })),
            tweaks: new fields.SchemaField(
              objectMap(costConfig.tweaks, v =>
                new fields.NumberField({ initial: 0, integer: true, label: v.label, min: 0, nullable: false })),
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
              source.costs[pointCost] = { type: "none", value: { formula: "", static: 0, variable: "" } };
            }
            if (typeof source.costs[pointCost] == "string") {
              const variableCost = String(pointCost === "mp" ? "manaCost" : "hitCost");
              source.costs[pointCost] = {
                type: "variable",
                value: { formula: "", static: 0, variable: variableCost || "" },
              };
            }
            if (typeof source.costs[pointCost] == "number") {
              source.costs[pointCost] = {
                type: "static",
                value: { formula: "", static: Number(source.costs[pointCost]), variable: "" },
              };
            }
            if (typeof source.costs[pointCost]?.value == "number") {
              source.costs[pointCost] = {
                type: "static",
                value: { formula: "", static: source.costs[pointCost].value, variable: "" },
              };
            }
            if (typeof source.costs[pointCost]?.value == "string") {
              source.costs[pointCost] = {
                type: "variable",
                value: { formula: "", static: 0, variable: String(source.costs[pointCost].value) },
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
          ...Object.entries(TERIOCK.config.stat).map(([k, v]) =>
            this.costs.primary[k].type === "formula"
              ? _loc("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
                cost: v.abbreviation,
                value: this.costs.primary[k].formula,
              })
              : this.costs.primary[k].type === "description"
              ? _loc("TERIOCK.SYSTEMS.Ability.PANELS.variable", { cost: v.abbreviation })
              : ""
          ),
          ...Object.entries(TERIOCK.config.cost.components.keys).map(([k, v]) =>
            this.costs.components[k].type ? v : ""
          ),
        ];
      }

      /** @inheritDoc */
      get _displayInputs() {
        return [...super._displayInputs, ...this._displayInputsCosts];
      }

      /**
       * Cost display inputs.
       * @returns {Teriock.Display.DisplayField[]}
       */
      get _displayInputsCosts() {
        return [
          ...Object.keys(TERIOCK.config.stat).map(k => `system.costs.primary.${k}.type`),
          ...Object.keys(TERIOCK.config.cost.components.keys).map(k => `system.costs.components.${k}.type`),
        ];
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
          ...Object.fromEntries(Object.entries(this.costs.tweaks).map(([k, v]) => [`tweaks.${k}`, v])),
          ...Object.fromEntries(
            Object.entries(this.costs.components).map(([k, v]) => [`components.${k}`, Number(Boolean(v.type))]),
          ),
          ...Object.fromEntries(
            Object.entries(this.costs.primary).map((
              [k, v],
            ) => [`costs.${k}`, v.type === "formula" ? v.formula : v.type === "description" ? "x" : 0]),
          ),
        });
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce invoked costs
        if (this.invoked) {
          if (!this.costs.components.somatic.type) { this.costs.components.somatic.type = "tag"; }
          if (!this.costs.components.verbal.type) { this.costs.components.verbal.type = "tag"; }
        }
      }
    }
  );
}
