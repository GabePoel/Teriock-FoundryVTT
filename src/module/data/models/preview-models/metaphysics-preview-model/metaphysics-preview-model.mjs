import { nullStringField } from "../../../fields/tools/builders.mjs";
import BasePreviewModel from "../base-preview-model/base-preview-model.mjs";

/**
 * @inheritDoc
 * @see {MetaphysicsSystemMixin}
 */
export default class MetaphysicsPreviewModel extends BasePreviewModel {
  /** @inheritDoc */
  static defineFilters() {
    return Object.assign(super.defineFilters(), {
      effectType: nullStringField({
        choices: TERIOCK.CONFIG.metaphysics.effectTypes,
        label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
      }),
      element: nullStringField({
        choices: TERIOCK.CONFIG.metaphysics.elements,
        label: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label",
      }),
      kind: nullStringField({ choices: TERIOCK.CONFIG.effect.kind, label: "TERIOCK.SYSTEMS.Child.FIELDS.kind.label" }),
      powerSource: nullStringField({
        choices: TERIOCK.CONFIG.metaphysics.powerSources,
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
