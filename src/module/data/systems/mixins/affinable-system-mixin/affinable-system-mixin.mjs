import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseAffinity } from "../../../pseudo-documents/affinities/abstract/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AffinableSystem & Teriock.Models.AffinableSystemData>}
 */
export default function AffinableSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.AffinableSystemData}
   * @mixin
   */
  class AffinableSystem extends Base {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { pseudos: { Affinity: "system.affinities" } });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { affinities: new PseudoCollectionField(BaseAffinity) });
    }
  }

  return AffinableSystem;
}
