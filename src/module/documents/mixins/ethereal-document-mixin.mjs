/**
 * Document mixin for placeables that can exist on the Ethereal plane.
 * @template {Constructor<ClientDocument>} T
 * @param {T} Base
 */
export default function EtherealDocumentMixin(Base) {
  return (
    /**
     * @extends {ClientDocument}
     * @mixin
     */
    class EtherealDocument extends Base {
      /**
       * Whether this document is on the Ethereal plane.
       * @returns {boolean}
       */
      get isEthereal() {
        return this.getFlag("teriock", "ethereal") ?? false;
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (changed.flags?.teriock && ("ethereal" in changed.flags.teriock)) {
          canvas.perception.update({ refreshVision: true });
        }
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        if (typeof this.getFlag("teriock", "ethereal") !== "boolean") {
          foundry.utils.setProperty(this, "flags.teriock.ethereal", false);
        }
      }
    }
  );
}
