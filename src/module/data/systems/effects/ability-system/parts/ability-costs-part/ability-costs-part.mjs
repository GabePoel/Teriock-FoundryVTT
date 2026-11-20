import { localizeChoices } from "../../../../../../helpers/localization.mjs";
import { mergeMetadata, objectMap } from "../../../../../../utils/_module.mjs";
import { FormulaField } from "../../../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../../../fields/tools/builders.mjs";

const { fields } = foundry.data;

/**
 * Ability costs part.
 *
 * Relevant wiki pages:
 * - [Costs](https://wiki.teriock.com/index.php/Core:Costs)
 *
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function AbilityCostsPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.AbilityCostsPartData}
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityCostsPart extends /** @type {InitializedDataModel<T, Teriock.Models.AbilityCostsPartData>} */ (Base) {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, {
      preserveOnRefresh: ["system.costs.tweaks", ...super.metadata.preserveOnRefresh],
    });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        costs: new fields.SchemaField({
          components: new fields.SchemaField(objectMap(TERIOCK.CONFIG.cost.components.keys, v => {
            const label = _loc("TERIOCK.COSTS.Long.component", { key: _loc(v) });
            return new fields.SchemaField({
              description: new fields.HTMLField({ label }),
              type: new fields.StringField({
                blank: true,
                choices: localizeChoices(TERIOCK.CONFIG.cost.components.types, { none: true }),
                initial: null,
                label,
                nullable: true,
              }),
            }, { label });
          })),
          primary: new fields.SchemaField(objectMap(TERIOCK.CONFIG.stat, v => {
            const label = _loc("TERIOCK.COSTS.Long.primary", { key: _loc(v.label) });
            return new fields.SchemaField({
              description: new fields.HTMLField({ label }),
              formula: rollableFormulaField({ label }),
            }, { label });
          })),
          tweaks: new fields.SchemaField(
            objectMap(TERIOCK.CONFIG.cost.tweaks, v =>
              new fields.NumberField({ initial: 0, integer: true, label: v.label, min: 0, nullable: false })),
          ),
        }),
      });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      for (const cost of Object.values(source.costs?.primary ?? {})) {
        if (!cost || !("type" in cost)) { continue; }
        if (cost.type !== "formula") { cost.formula = ""; }
        if (cost.type !== "description") { cost.description = ""; }
        delete cost.type;
      }
      return super.migrateData(source, options);
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
        ...Object.entries(TERIOCK.CONFIG.cost.components.keys).map(([k, v]) => this.costs.components[k].type ? v : "")
          .filter(Boolean).map(w => ({ label: w, tooltip: _loc("TERIOCK.COMMON.Components") })),
      ];
    }

    /**
     * Primary cost tags.
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _costTagsPrimary() {
      return [
        ...Object.entries(TERIOCK.CONFIG.stat).map(([k, v]) =>
          FormulaField.exists(this.costs.primary[k].formula)
            ? _loc("TERIOCK.SYSTEMS.Ability.PANELS.constant", {
              cost: v.abbreviation,
              value: this.costs.primary[k].formula,
            })
            : this.costs.primary[k].description
            ? _loc("TERIOCK.SYSTEMS.Ability.PANELS.variable", { cost: v.abbreviation })
            : ""
        ).filter(Boolean).map(w => ({ label: w, tooltip: _loc("TERIOCK.COMMON.Costs") })),
      ];
    }

    /** @inheritDoc */
    get _displayAddOptions() {
      const options = super._displayAddOptions;
      for (const [k, v] of Object.entries(TERIOCK.CONFIG.stat)) {
        if (!FormulaField.exists(this.costs.primary[k].formula)) {
          options.push({
            group: "costs",
            id: `cost${k.capitalize()}`,
            label: _loc("TERIOCK.COSTS.Long.formula", { key: v.label }),
            subgroup: "formulas",
            update: { [`system.costs.primary.${k}.formula`]: "1" },
          });
        }
      }
      for (const [k, v] of Object.entries(TERIOCK.CONFIG.cost.tweaks)) {
        if (!this.costs.tweaks[k]) {
          options.push({
            group: "costs",
            id: `tweak${k.capitalize()}`,
            label: v.label,
            subgroup: "tweaks",
            update: { [`system.costs.tweaks.${k}`]: 1 },
          });
        }
      }
      return options;
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
      return Object.keys(TERIOCK.CONFIG.cost.components.keys).map(k => ({
        group: "costs",
        path: `system.costs.components.${k}.type`,
      }));
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        ...Object.fromEntries(Object.entries(this.costs.tweaks).map(([k, v]) => [`tweak.${k}`, v])),
        ...Object.fromEntries(
          Object.entries(this.costs.components).map(([k, v]) => [`component.${k}`, Number(Boolean(v.type))]),
        ),
        ...Object.fromEntries(
          Object.entries(this.costs.primary).map((
            [k, v],
          ) => [`cost.${k}`, FormulaField.exists(v.formula) ? v.formula : v.description ? 1 : 0]),
        ),
      });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();

      // Enforce invoked costs
      if (this.invoked) {
        this.costs.components.somatic.type ||= "tag";
        this.costs.components.verbal.type ||= "tag";
      }
    }
  }

  return AbilityCostsPart;
}
