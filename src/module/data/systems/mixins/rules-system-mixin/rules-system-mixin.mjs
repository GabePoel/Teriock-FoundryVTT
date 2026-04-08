import { IdentifierField } from "../../../fields/_module.mjs";
import { BaseSystemMixin } from "../_module.mjs";

/**
 * @param {typeof TypeDataModel} Base
 */
export default function RulesSystemMixin(Base) {
  return (
    /**
     * @extends {Teriock.Models.RulesSystemData}
     * @mixes BaseSystem
     * @mixin
     */
    class RulesSystem extends BaseSystemMixin(Base) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Rules",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          identifier: new IdentifierField(),
        });
      }
    }
  );
}
