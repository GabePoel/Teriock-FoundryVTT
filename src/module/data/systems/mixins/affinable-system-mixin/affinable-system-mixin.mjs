import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseAffinity } from "../../../pseudo-documents/affinities/abstract/_module.mjs";

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function AffinableSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.AffinableSystemData}
   */
  class AffinableSystem extends /** @type {InitializedDataModel<T, Teriock.Models.AffinableSystemData>} */ (Base) {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { pseudos: { Affinity: "system.affinities" } });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { affinities: new PseudoCollectionField(BaseAffinity) });
    }
  }

  return AffinableSystem;
}
