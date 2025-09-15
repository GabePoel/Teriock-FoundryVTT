/**
 * Mixin for common functions used across document classes.
 * @param {ClientDocument} Base
 * @mixin
 */
export default (Base) => {
  // noinspection JSClosureCompilerSyntax
  return (/**
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
    getAbilities() {
    }

    /** @inheritDoc */
    getProperties() {
    }

    /**
     * @inheritDoc
     * @param {Teriock.Parameters.Shared.PseudoHook} pseudoHook
     * @param {Partial<Teriock.HookData.BaseHookData>} [data]
     * @param {TeriockEffect} [effect]
     * @param {boolean} [skipCall]
     * @returns {Promise<Teriock.HookData.BaseHookData>}
     */
    async hookCall(pseudoHook, data = {}, effect = null, skipCall = false) {
      data.cancel = false;
      if (this.system.hookedMacros) {
        if (!data) {
          data = {};
        }
        data.cancel = false;
        if (!skipCall) {
          Hooks.callAll(`teriock.${pseudoHook}`, this, data);
          skipCall = true;
        }
        let macroUuids = this.system.hookedMacros[pseudoHook];
        if (macroUuids) {
          if (effect) {
            macroUuids = macroUuids.filter((uuid) => effect.changes
              .filter((c) => c.key === `system.hookedMacros.${pseudoHook}`)
              .map((c) => c.value)
              .includes(uuid));
          }
          for (const macroUuid of macroUuids) {
            /** @type {TeriockMacro} */
            const macro = await foundry.utils.fromUuid(macroUuid);
            if (macro) {
              await macro.execute({
                actor: this,
                data: data,
              });
            }
          }
        }
      }
      if (this.documentName !== "Actor") {
        await this.actor.hookCall(pseudoHook, data, effect, skipCall);
      }
      return /** @type {Teriock.HookData.BaseHookData} */ data;
    }

    /** @inheritDoc */
    async toggleDisabled() {
      await this.update({ "system.disabled": !this.system.disabled });
    }
  });
};
