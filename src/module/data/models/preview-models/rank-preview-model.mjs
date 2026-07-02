import { TernaryField } from "../../fields/_module.mjs";
import { archetypeField, classField } from "../../fields/tools/builders.mjs";
import BasePreviewModel from "./base-preview-model.mjs";

/**
 * Preview model for ranks that also works for archetypes.
 * @inheritDoc
 * @property {Teriock.Models.RankFilters} filters
 * @see {ArchetypeSystem}
 * @see {RankSystem}
 */
export default class RankPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      archetype: archetypeField({ initial: null, nullable: true }),
      class: classField({ initial: null, nullable: true }),
      innate: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.innate.label") }),
    });
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [...super._formPathsSelect, "filters.archetype", "filters.class"];
  }

  /** @inheritDoc */
  get _formPathsTernary() {
    return [...super._formPathsTernary, "filters.innate"];
  }

  /**
   * @inheritDoc
   * @param {(TeriockRank|TeriockArchetype)[]} documents
   * @returns {Generator<TeriockRank|TeriockArchetype, void, void>}
   */
  *filterDocuments(documents) {
    const f = this.filters;
    for (const document of super.filterDocuments(documents)) {
      const system = document?.system;
      let matches;
      if (document?.type === "archetype") {
        matches = this._checkValueFilter(f.archetype, document?.typedIdentifier)
          && (!f.class || document.system.classIdentifiers?.has(f.class));
      } else {
        matches = this._checkValueFilter(f.archetype, system?.archetype)
          && this._checkValueFilter(f.class, system?.class);
      }
      matches &&= this._checkTernaryFilter(f.innate, system?.innate);
      if (matches) { yield document; }
    }
  }
}
