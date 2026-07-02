import { fieldField, tradecraftField } from "../../fields/tools/builders.mjs";
import BasePreviewModel from "./base-preview-model.mjs";

/**
 * @inheritDoc
 * @property {Teriock.Models.FluencyFilters} filters
 * @see {FluencySystem}
 */
export default class FluencyPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      field: fieldField({ initial: null, nullable: true }),
      tradecraft: tradecraftField({ initial: null, nullable: true }),
    });
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [...super._formPathsSelect, "filters.field", "filters.tradecraft"];
  }

  /**
   * @inheritDoc
   * @param {TeriockFluency[]} documents
   * @returns {Generator<TeriockFluency, void, void>}
   */
  *filterDocuments(documents) {
    for (const document of super.filterDocuments(documents)) {
      if (
        this._checkValueFilter(this.filters.field, document?.system?.field)
        && this._checkValueFilter(this.filters.tradecraft, document?.system?.tradecraft)
      ) { yield document; }
    }
  }
}
