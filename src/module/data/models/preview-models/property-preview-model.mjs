import { TernaryField } from "../../fields/_module.mjs";
import MetaphysicsPreviewModel from "./metaphysics-preview-model.mjs";

/**
 * @typedef {MetaphysicsFilters} PropertyFilters
 * @property {boolean|null} applyIfDampened
 * @property {boolean|null} applyIfDeattuned
 * @property {boolean|null} applyIfShattered
 * @property {boolean|null} applyIfUnequipped
 * @property {boolean|null} consumable
 */

/**
 * @property {PropertyFilters} filters
 */
export default class PropertyPreviewModel extends MetaphysicsPreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      applyIfDampened: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Granted.FIELDS.applyIfDampened.label") }),
      applyIfDeattuned: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.BaseEffect.FIELDS.applyIfDeattuned.label") }),
      applyIfShattered: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Granted.FIELDS.applyIfShattered.label") }),
      applyIfUnequipped: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Granted.FIELDS.applyIfUnequipped.label") }),
      consumable: new TernaryField({ label: _loc("TERIOCK.SYSTEMS.Consumable.FIELDS.consumable.label") }),
    });
  }

  /** @inheritDoc */
  get _formPathsTernary() {
    return [
      ...super._formPathsTernary,
      "filters.applyIfDampened",
      "filters.applyIfDeattuned",
      "filters.applyIfShattered",
      "filters.applyIfUnequipped",
      "filters.consumable",
    ];
  }

  /**
   * @inheritDoc
   * @param {TeriockProperty[]} documents
   * @returns {Generator<TeriockProperty, void, void>}
   */
  *filterDocuments(documents) {
    const f = this.filters;
    for (const document of super.filterDocuments(documents)) {
      const system = document?.system;
      if (
        this._checkTernaryFilter(f.applyIfDampened, system?.applyIfDampened)
        && this._checkTernaryFilter(f.applyIfDeattuned, system?.applyIfDeattuned)
        && this._checkTernaryFilter(f.applyIfShattered, system?.applyIfShattered)
        && this._checkTernaryFilter(f.applyIfUnequipped, system?.applyIfUnequipped)
        && this._checkTernaryFilter(f.consumable, system?.consumable)
      ) { yield document; }
    }
  }
}
