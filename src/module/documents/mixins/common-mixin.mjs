/**
 * Mixing for common functions used across document classes.
 *
 * @param {ClientDocument} Base
 * @returns {{new(): CommonDocument, prototype: CommonDocument}}
 * @mixin
 */
export default (Base) => {
  return class CommonDocument extends Base {
    /**
     * @returns {Teriock.UUID<TeriockActor|TeriockItem|TeriockEffect>}
     */
    get uuid() {
      return super.uuid;
    }

    /**
     * Returns the actor that this effect is associated with if there is one.
     *
     * @returns {TeriockActor|null}
     */
    get actor() {
      if (this.documentName === "Actor") {
        return /** @type {TeriockActor} */ this;
      } else if (this.parent) {
        return this.parent.actor;
      }
      return null;
    }

    /**
     * Execute all macros for a given pseudo-hook and call a regular hook with the same name.
     *
     * @param {Teriock.Parameters.Actor.PseudoHook} name - The name of the pseudo-hook and hook to call.
     * @param {...any[]} args - Arguments to pass to the pseudo-hook macros and the hook.
     */
    async hookCall(name, ...args) {
      if (this.actor) return await this.actor.hookCall(name, ...args);
    }

    /**
     * Forces an update of the document by toggling the update counter.
     * This is useful for triggering reactive updates in the UI.
     *
     * @returns {Promise<void>} Promise that resolves when the document is updated.
     */
    async forceUpdate() {
      await this.update({ "system.updateCounter": !this.system.updateCounter });
    }

    /**
     * Disables the document by setting its disabled property to true.
     *
     * @returns {Promise<void>} Promise that resolves when the document is disabled.
     */
    async disable() {
      await this.update({ "system.disabled": true });
    }

    /**
     * Enables the document by setting its disabled property to false.
     *
     * @returns {Promise<void>} Promise that resolves when the document is enabled.
     */
    async enable() {
      await this.update({ "system.disabled": false });
    }

    /**
     * Toggles the disabled state of the document.
     *
     * @returns {Promise<void>} Promise that resolves when the disabled state is toggled.
     */
    async toggleDisabled() {
      await this.update({ "system.disabled": !this.system.disabled });
    }
  };
};
