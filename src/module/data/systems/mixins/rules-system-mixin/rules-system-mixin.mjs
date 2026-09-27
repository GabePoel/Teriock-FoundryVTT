import { IdentifierField } from "../../../fields/_module.mjs";

/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * @template {MixinBase<typeof TypeDataModel>} T
 * @param {T} Base
 */
export default function RulesSystemMixin(Base) {
  /**
   * @mixin
   */
  class RulesSystem extends /** @type {InitializedDataModel<T, Teriock.Models.RulesSystemData>} */ (Base) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Rules"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { identifier: new IdentifierField() });
    }
  }

  return RulesSystem;
}
