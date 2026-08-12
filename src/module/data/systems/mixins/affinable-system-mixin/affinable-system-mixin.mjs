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
    /**
     * Array of the types of affinities that this system can have.
     * @returns {(typeof Affinity)[]}
     */
    static get _affinityTypes() {
      return [];
    }

    /**
     * The types of affinities that this system can have.
     * @returns {Record<string, (typeof Affinity)>}
     */
    static get affinityTypes() {
      return Object.fromEntries(this._affinityTypes.map(a => [a.TYPE, a]));
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { pseudos: { Affinity: "system.affinities" } });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        affinities: new PseudoCollectionField(BaseAffinity, { types: this.affinityTypes }),
      });
    }

    /**
     * Active affinities.
     * @returns {Affinity[]}
     */
    get activeAffinities() {
      return this.affinities.contents.filter(a => a.active && a.valid);
    }
  }

  return AffinableSystem;
}
