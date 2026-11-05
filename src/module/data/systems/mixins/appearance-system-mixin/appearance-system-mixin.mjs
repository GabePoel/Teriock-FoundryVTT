const { fields } = foundry.data;

/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * Mixin for documents that have a physical appearance.
 * @template {MixinBase<typeof TypeDataModel>} T
 * @param {T} Base
 */
export default function AppearanceSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.AppearanceSystemData}
   */
  class AppearanceSystem extends /** @type {InitializedDataModel<T, Teriock.Models.AppearanceSystemData>} */ (Base) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Appearance"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { appearance: new fields.HTMLField() });
    }

    /** @inheritDoc */
    get _displayFieldsContent() {
      return ["system.appearance", ...super._displayFieldsContent];
    }
  }

  return AppearanceSystem;
}
