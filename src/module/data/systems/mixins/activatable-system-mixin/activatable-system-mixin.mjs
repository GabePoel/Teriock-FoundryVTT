import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseActivation } from "../../../pseudo-documents/activations/abstract/_module.mjs";

/**
 * @param {typeof BaseSystem} Base
 */
export default function ActivatableSystemMixin(Base) {
  return (
    /**
     * @extends {BaseSystem}
     * @extends {Teriock.Models.ActivatableSystemData}
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
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          activations: new PseudoCollectionField(BaseActivation, { types: this.activationTypes }),
        });
      }

      /** @inheritDoc */
      get pseudoCollections() {
        return Object.assign(super.pseudoCollections, { Activation: this.activations });
      }

      /**
       * Connect all activation listeners to some HTML element.
       * @param {HTMLElement} element
       */
      _connectActivationListeners(element) {
        element.querySelectorAll("button[data-action=activate-activation]").forEach(
          /** @param {HTMLButtonElement} btn */ btn => {
            const id = btn.dataset.id;
            if (!id) { return; }
            const activation = /** @type {BaseActivation} */ this.activations.get(id);
            if (!activation) { return; }
            btn.addEventListener("click", ev => {
              ev.stopImmediatePropagation();
              ev.stopPropagation();
              ev.preventDefault();
              activation.event = ev;
              activation.primaryAction();
            });
            btn.addEventListener("contextmenu", ev => {
              ev.stopImmediatePropagation();
              ev.stopPropagation();
              ev.preventDefault();
              activation.event = ev;
              activation.secondaryAction();
            });
          },
        );
      }
    }
  );
}
