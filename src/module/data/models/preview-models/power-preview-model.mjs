import { objectMap } from "../../../helpers/utils.mjs";
import { nullString } from "../../fields/helpers/builders.mjs";
import BasePreviewModel from "./base-preview-model.mjs";

/**
 * @property {Teriock.Models.PowerFilters} filters
 */
export default class PowerPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      type: nullString({
        choices: objectMap(TERIOCK.config.power.type, v => v.label),
        label: _loc("TERIOCK.SYSTEMS.Power.FIELDS.type.label"),
      }),
    });
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [...super._formPathsSelect, "filters.type"];
  }

  /**
   * @inheritDoc
   * @param {TeriockPower[]} documents
   * @returns {Generator<TeriockPower, void, void>}
   */
  *filterDocuments(documents) {
    for (const document of super.filterDocuments(documents)) {
      if (this._checkValueFilter(this.filters.type, document?.system?.type)) { yield document; }
    }
  }
}
