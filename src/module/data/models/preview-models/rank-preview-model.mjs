import { rankSort } from "../../../helpers/sort.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { archetypeField, classField, nullString } from "../../fields/tools/builders.mjs";
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
  static get defaultSortOption() {
    return "default";
  }

  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      archetype: archetypeField({ initial: null, nullable: true }),
      class: classField({ initial: null, nullable: true }),
      kind: nullString({
        choices: objectMap(TERIOCK.config.class.kind, v => v.label),
        label: _loc("TERIOCK.SYSTEMS.Child.FIELDS.kind.label"),
      }),
    });
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [...super._formPathsSelect, "filters.archetype", "filters.class", "filters.kind"];
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
      // Archetypes have no kind of their own, so they take the kind of the ranks they hold.
      matches &&= this._checkValueFilter(f.kind, system?.kind ?? (system?.innate ? "innate" : "learned"));
      if (matches) { yield document; }
    }
  }

  /** @inheritDoc */
  sortDocuments(documents) {
    if (!Array.isArray(documents) || documents.length === 0) { return []; }
    if (this.sort.option === "default") {
      const sorted = rankSort([...documents]);
      return this.sort.ascending ? sorted : sorted.reverse();
    }
    return super.sortDocuments(documents);
  }
}
