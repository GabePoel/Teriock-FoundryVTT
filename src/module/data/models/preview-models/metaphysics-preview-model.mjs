import effectConfig from "../../../constants/config/effect-config.mjs";
import { nullString } from "../../fields/tools/builders.mjs";
import BasePreviewModel from "./base-preview-model.mjs";

/**
 * @inheritDoc
 * @property {Teriock.Models.MetaphysicsFilters} filters
 * @see {MetaphysicsSystemMixin}
 */
export default class MetaphysicsPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      effectType: nullString({
        choices: TERIOCK.reference.effectTypes,
        label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
      }),
      element: nullString({
        choices: TERIOCK.reference.elements,
        label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label",
      }),
      kind: nullString({ choices: effectConfig.kind, label: "TERIOCK.SYSTEMS.Child.FIELDS.kind.label" }),
      powerSource: nullString({
        choices: TERIOCK.reference.powerSources,
        label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.powerSources.label",
      }),
    });
  }

  /** @inheritDoc */
  get _formPathsSelect() {
    return [...super._formPathsSelect, "filters.effectType", "filters.element", "filters.kind", "filters.powerSource"];
  }

  /** @inheritDoc */
  *filterDocuments(documents) {
    for (const document of super.filterDocuments(documents)) {
      if (
        this._checkValueFilter(this.filters.effectType, document?.system?.effectTypes)
        && this._checkValueFilter(this.filters.element, document?.system?.elements)
        && this._checkValueFilter(this.filters.kind, document?.system?.kind)
        && this._checkValueFilter(this.filters.powerSource, document?.system?.powerSources)
      ) { yield document; }
    }
  }
}
