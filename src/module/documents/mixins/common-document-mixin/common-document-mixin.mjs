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

      /** @inheritDoc */
      async hookCall(name, ...args) {
        if (this.actor) return await this.actor.hookCall(name, ...args);
      }

      /** @inheritDoc */
      async toggleDisabled() {
        await this.update({ "system.disabled": !this.system.disabled });
      }
    }
  );
};
