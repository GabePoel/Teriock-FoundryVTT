import { PseudoCollectionField } from "../../../fields/_module.mjs";
import * as affinities from "../../../pseudo-documents/affinities/_module.mjs";
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
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { pseudos: { Affinity: "system.affinities" } });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        affinities: new PseudoCollectionField(BaseAffinity, {
          types: Object.fromEntries(
            Object.values(affinities).filter(a => foundry.utils.isSubclass(a, BaseAffinity)).map(
              a => [a.metadata.type, a]
            ),
          ),
        }),
      });
    }
  }

  return AffinableSystem;
}
