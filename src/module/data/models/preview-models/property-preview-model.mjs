import { TernaryField } from "../../fields/_module.mjs";
import MetaphysicsPreviewModel from "./metaphysics-preview-model.mjs";

/**
 * @property {Teriock.Models.PropertyFilters} filters
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
      const s = document?.system;
      if (
        this._checkTernaryFilter(f.applyIfDampened, s?.applyIfDampened)
        && this._checkTernaryFilter(f.applyIfDeattuned, s?.applyIfDeattuned)
        && this._checkTernaryFilter(f.applyIfShattered, s?.applyIfShattered)
        && this._checkTernaryFilter(f.applyIfUnequipped, s?.applyIfUnequipped)
        && this._checkTernaryFilter(f.consumable, s?.consumable)
      ) { yield document; }
    }
  }
}
