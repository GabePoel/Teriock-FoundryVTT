import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseAffinity } from "../../../pseudo-documents/affinities/abstract/_module.mjs";

/**
 * @template {Constructor<TeriockSystem>} T
 * @param {T} Base
 */
export default function AffinableSystemMixin(Base) {
  /**
   * @extends {ReturnType<TeriockSystem}
   * @extends {Teriock.Models.AffinableSystemData}
   * @mixin
   */
  class AffinableSystem extends Base {
    /**
     * Array of the types of affinities that this system can have.
     * @returns {(typeof AnyAffinity)[]}
     */
    static get _affinityTypes() {
      return [];
    }

    /**
     * The types of affinities that this system can have.
     * @returns {Record<string, (typeof AnyAffinity)>}
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
     * @returns {AnyAffinity[]}
     */
    get activeAffinities() {
      return this.affinities.contents.filter(a => a.active && a.valid);
    }
  }

  return AffinableSystem;
}
