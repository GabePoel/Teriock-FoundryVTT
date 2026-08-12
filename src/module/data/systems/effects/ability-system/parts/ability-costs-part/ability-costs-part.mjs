import costConfig from "../../../../../../constants/config/cost-config.mjs";
import statConfig from "../../../../../../constants/config/stat-config.mjs";
import { localizeChoices } from "../../../../../../helpers/localization.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";
import { rollableFormulaField } from "../../../../../fields/tools/builders.mjs";

const { fields } = foundry.data;

/**
 * Ability costs part.
 *
 * Relevant wiki pages:
 * - [Costs](https://wiki.teriock.com/index.php/Core:Costs)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityCostsPart & Teriock.Models.AbilityCostsPartData>}
 */
export default function AbilityCostsPart(Base) {
  /**
   * @implements {Teriock.Models.AbilityCostsPartData}
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
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
                blank: true,
                choices: localizeChoices(costConfig.components.types, { none: true }),
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
              formula: rollableFormulaField({ label }),
              type: new fields.StringField({
                blank: true,
                choices: localizeChoices(costConfig.primary.types, { none: true }),
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

    /**
     * Cost tags.
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _costTags() {
      return [...this._costTagsComponents, ...this._costTagsPrimary];
    }

    /**
     * Component cost tags.
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _costTagsComponents() {
      return [
        ...Object.entries(TERIOCK.config.cost.components.keys).map(([k, v]) => this.costs.components[k].type ? v : "")
          .filter(Boolean).map(w => ({ label: w, tooltip: _loc("TERIOCK.COMMON.Components") })),
      ];
    }

    /**
     * Primary cost tags.
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _costTagsPrimary() {
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
        ).filter(Boolean).map(w => ({ label: w, tooltip: _loc("TERIOCK.COMMON.Costs") })),
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
          ) => [`costs.${k}`, v.type === "formula" ? (v.formula || 0) : v.type === "description" ? "x" : 0]),
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

  return AbilityCostsPart;
}
