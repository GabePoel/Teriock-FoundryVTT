import { IdentifierField } from "../../../fields/_module.mjs";

/**
 * @import { TypeDataModel } from "@common/abstract/_module.mjs";
 */

/**
 * @template {Constructor<TypeDataModel>} T
 * @param {T} Base
 * @returns {MixinResult<T, RulesSystem & Teriock.Models.RulesSystemData>}
 */
export default function RulesSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.RulesSystemData}
   * @mixin
   */
  class RulesSystem extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Rules"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { identifier: new IdentifierField() });
    }
  }

  return RulesSystem;
}
