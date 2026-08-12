import { objectMap } from "../../../../helpers/utils.mjs";
import { nullString } from "../../../fields/tools/builders.mjs";
import BasePreviewModel from "../base-preview-model/base-preview-model.mjs";

/**
 * @inheritDoc
 * @see {PowerSystem}
 */
export default class PowerPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      kind: nullString({
        choices: objectMap(TERIOCK.config.power.kind, v => v.label),
        label: "TERIOCK.SYSTEMS.Child.FIELDS.kind.label",
      }),
    });
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [...super._formPathsSelect, "filters.kind"];
  }

  /**
   * @inheritDoc
   * @param {TeriockPower[]} documents
   * @returns {Generator<TeriockPower, void, void>}
   */
  *filterDocuments(documents) {
    for (const document of super.filterDocuments(documents)) {
      if (this._checkValueFilter(this.filters.kind, document?.system?.kind)) { yield document; }
    }
  }
}
