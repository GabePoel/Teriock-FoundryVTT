import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActivatableSystem & Teriock.Models.ActivatableSystemData>}
 */
export default function ActivatableSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.ActivatableSystemData}
   * @mixin
   */
  class ActivatableSystem extends Base {
    /**
     * Array of the types of activations that this system can have.
     * @returns {(typeof BaseActivation)[]}
     */
    static get _activationTypes() {
      return [];
    }

    /**
     * The types of activations that this system can have.
     * @returns {Record<string, Teriock.Activations.Any>}
     */
    static get activationTypes() {
      return Object.fromEntries(
        this._activationTypes.map(a => [a.TYPE, a]).sort((a, b) => a[1].LABEL.localeCompare(b[1].LABEL)),
      );
    }

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { pseudos: { Activation: "system.activations" } });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        activations: new PseudoCollectionField(BaseActivation, { types: this.activationTypes }),
      });
    }
  }

  return ActivatableSystem;
}
