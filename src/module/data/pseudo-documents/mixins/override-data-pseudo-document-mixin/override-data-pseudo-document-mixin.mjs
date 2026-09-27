import { defaultJSONField } from "../../../fields/tools/builders.mjs";

const { fields } = foundry.data;

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function OverrideDataPseudoDocumentMixin(Base) {
  /**
   * @mixin
   */
  class OverrideDataPseudoDocument
    extends /** @type {InitializedDataModel<T, Teriock.PseudoDocuments.OverrideDataPseudoDocumentData>} */ (Base)
  {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.OverrideData"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        data: defaultJSONField(),
        overrideData: new fields.BooleanField({ initial: false }),
      });
    }

    /**
     * Override data paths.
     * @returns {string[]}
     */
    get _overrideDataPaths() {
      const paths = ["overrideData"];
      if (this.overrideData) { paths.push("data"); }
      return paths;
    }

    /** @inheritDoc */
    _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
      if (path === "data") { groupConfig.stacked = true; }
      return super._makeFormGroup(path, groupConfig, inputConfig, config);
    }

    /** @inheritDoc */
    prepareData() {
      super.prepareData();
      if (this.overrideData === false) { this.data = {}; }
    }
  }

  return OverrideDataPseudoDocument;
}
