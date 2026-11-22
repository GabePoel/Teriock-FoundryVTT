import { levelField, slugSetField } from "../../../fields/tools/builders.mjs";

/**
 * Data mixin to support taxonomy tags.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function TaxonomySystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.TaxonomySystemData}
   */
  class TaxonomySystem extends /** @type {InitializedDataModel<T, Teriock.Models.TaxonomySystemData>} */ (Base) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Taxonomy"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        families: slugSetField(TERIOCK.CONFIG.species.families),
        traits: slugSetField(TERIOCK.CONFIG.species.traits),
        undeadLevel: levelField(TERIOCK.CONFIG.species.undeadLevels),
      });
    }

    /** @inheritDoc */
    get _displayInputs() {
      return [
        ...super._displayInputs,
        "system.traits",
        ...(this.traits.has("undead") ? ["system.undeadLevel"] : []),
        "system.families",
      ];
    }

    /** @inheritDoc */
    get _displayTags() {
      return [...super._displayTags, ...this._taxonomyTags];
    }

    /**
     * Taxonomy tags.
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _taxonomyTags() {
      const { families, traits, undeadLevel } = this.taxonomy;
      return [
        ...Array.from(traits, t => ({
          label: TERIOCK.CONFIG.species.traits[t]?.label,
          tooltip: "TERIOCK.SYSTEMS.Taxonomy.FIELDS.traits.label",
        })),
        ...(undeadLevel
          ? [{
            label: TERIOCK.CONFIG.species.undeadLevels[undeadLevel],
            tooltip: "TERIOCK.SYSTEMS.Taxonomy.FIELDS.undeadLevel.label",
          }]
          : []),
        ...Array.from(families, f => ({
          label: TERIOCK.CONFIG.species.families[f]?.label,
          tooltip: "TERIOCK.SYSTEMS.Taxonomy.FIELDS.families.label",
        })),
      ];
    }

    /**
     * The taxonomy describing this document.
     * @returns {Pick<Teriock.Models.TaxonomySystemData, "families" | "traits" | "undeadLevel">}
     */
    get taxonomy() {
      return { families: this.families, traits: this.traits, undeadLevel: this.undeadLevel };
    }

    /** @inheritDoc */
    getLocalRollData() {
      const data = super.getLocalRollData();
      const { families, traits, undeadLevel } = this.taxonomy;
      for (const f of families) { data[`family.${f}`] = 1; }
      for (const t of traits) { data[`trait.${t}`] = 1; }
      data.undead = undeadLevel;
      return data;
    }
  }

  return TaxonomySystem;
}
