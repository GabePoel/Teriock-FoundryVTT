import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseExpiration } from "../../../pseudo-documents/expirations/abstract/_module.mjs";

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ExpirableSystemMixin(Base) {
  /**
   * @mixin
   */
  class ExpirableSystem extends /** @type {InitializedDataModel<T, Teriock.Models.ExpirableSystemData>} */ (Base) {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { pseudos: { Expiration: "system.expirations" } });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { expirations: new PseudoCollectionField(BaseExpiration) });
    }
  }

  return ExpirableSystem;
}
