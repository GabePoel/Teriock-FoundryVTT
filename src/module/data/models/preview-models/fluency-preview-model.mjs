import tradecraftConfig from "../../../constants/config/tradecraft-config.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
import { IdentifierField } from "../../fields/_module.mjs";
import BasePreviewModel from "./base-preview-model.mjs";

/**
 * @property {Teriock.Models.FluencyFilters} filters
 */
export default class FluencyPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      field: new IdentifierField({
        choices: objectMap(tradecraftConfig.fields, f => f.label, { localize: true }),
        initial: null,
        label: _loc("TERIOCK.SYSTEMS.Fluency.FIELDS.field.label"),
        nullable: true,
        type: "field",
      }),
      tradecraft: new IdentifierField({
        choices: TERIOCK.reference.tradecrafts,
        initial: null,
        label: _loc("TERIOCK.TERMS.Common.tradecraft"),
        nullable: true,
        type: "tradecraft",
      }),
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
