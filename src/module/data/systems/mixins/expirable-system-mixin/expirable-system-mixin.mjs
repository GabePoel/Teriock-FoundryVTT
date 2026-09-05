import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseExpiration } from "../../../pseudo-documents/expirations/abstract/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ExpirableSystem & Teriock.Models.ExpirableSystemData>}
 */
export default function ExpirableSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.ExpirableSystemData}
   * @mixin
   */
  class ExpirableSystem extends Base {
    /**
     * Array of the types of expirations that this system can have.
     * @returns {(typeof Expiration)[]}
     */
    static get _expirationTypes() {
      return [];
    }

    /**
     * The types of expirations that this system can have.
     * @returns {Record<string, (typeof Expiration)>}
     */
    static get expirationTypes() {
      return Object.fromEntries(this._expirationTypes.map(e => [e.metadata.type, e]));
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { pseudos: { Expiration: "system.expirations" } });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        expirations: new PseudoCollectionField(BaseExpiration, { types: this.expirationTypes }),
      });
    }
  }

  return ExpirableSystem;
}
