/**
 * Mixing for common functions used across document classes.
 *
 * @param {ClientDocument} Base
 * @mixin
 */
export default (Base) => {
  return (
    /**
     * @implements {CommonDocumentMixinInterface}
     * @extends ClientDocument
     */
    class CommonDocumentMixin extends Base {
      /** @inheritDoc */
      get metadata() {
        return this.system.constructor.metadata;
      }

      /** @inheritDoc */
      get nameString() {
        return this.system.nameString;
      }

      /** @inheritDoc */
      get uuid() {
        return super.uuid;
      }

      /** @inheritDoc */
      async disable() {
        await this.update({ "system.disabled": true });
      }

      /** @inheritDoc */
      async enable() {
        await this.update({ "system.disabled": false });
      }

      /** @inheritDoc */
      async forceUpdate() {
        await this.update({
          "system.updateCounter": !this.system.updateCounter,
        });
      }

      /**
       * @inheritDoc
       * @param {Teriock.Parameters.Actor.PseudoHook} pseudoHook
       * @param {Partial<Teriock.HookData.BaseHookData>} [data]
       * @param {TeriockEffect} [effect]
       * @returns {Promise<Teriock.HookData.BaseHookData>}
       */
      async hookCall(pseudoHook, data = {}, effect = null) {
        data.cancel = false;
        if (this.actor) return await this.actor.hookCall(pseudoHook, data, effect);
        else return /** @type {Teriock.HookData.BaseHookData} */ data;
      }

      /** @inheritDoc */
      async toggleDisabled() {
        await this.update({ "system.disabled": !this.system.disabled });
      }
    }
  );
};
