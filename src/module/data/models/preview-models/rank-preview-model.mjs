import classConfig from "../../../constants/config/class-config.mjs";
import { toKebabCase } from "../../../helpers/string.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { IdentifierField } from "../../fields/_module.mjs";
import BasePreviewModel from "./base-preview-model.mjs";

/** @type {Record<Teriock.Keys.Class, Teriock.Keys.Archetype>} */
const CLASS_ARCHETYPES = Object.fromEntries(
  Object.entries(classConfig.classes).map(([k, v]) => [toKebabCase(k), v.archetype]),
);

/**
 * @typedef {BaseFilters} RankFilters
 * @property {Teriock.Keys.Archetype|null} archetype
 * @property {Teriock.Keys.Class|null} class
 */

/**
 * Preview model for ranks that also works for archetypes.
 * @property {RankFilters} filters
 */
export default class RankPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      archetype: new IdentifierField({
        choices: objectMap(classConfig.archetypes, a => a.label, { localize: true }),
        initial: null,
        label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label"),
        nullable: true,
        type: "archetype",
      }),
      class: new IdentifierField({
        choices: Object.fromEntries(
          Object.entries(classConfig.classes).map(([k, v]) => [toKebabCase(k), _loc(v.label)]),
        ),
        initial: null,
        label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.class.label"),
        nullable: true,
        type: "class",
      }),
    });
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [...super._formPathsSelect, "filters.archetype", "filters.class"];
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
        matches = this._checkValueFilter(f.archetype, system?.typedIdentifier)
          && (!f.class || CLASS_ARCHETYPES[f.class] === system?.identifier);
      } else {
        matches = this._checkValueFilter(f.archetype, system?.archetype)
          && this._checkValueFilter(f.class, system?.class);
      }
      if (matches) { yield document; }
    }
  }
}
