import { systemPath } from "../../../helpers/path.mjs";
import { TeriockActor } from "../../_module.mjs";
import EmbedCardDocumentMixin from "../embed-card-document-mixin/embed-card-document-mixin.mjs";

/**
 * Mixin for common functions used across document classes.
 * @param {typeof ClientDocument} Base
 * @constructor
 */
export default function CommonDocumentMixin(Base) {
  return (
    /**
     * @implements {CommonDocumentMixinInterface}
     * @extends ClientDocument
     * @mixes EmbedCardDocument
     * @mixin
     */
    class CommonDocument extends EmbedCardDocumentMixin(Base) {
      /** @inheritDoc */
      get actor() {
        if (this instanceof TeriockActor) {
          return this;
        } else if (this.parent) {
          return this.parent.actor;
        } else {
          return null;
        }
      }

      /** @inheritDoc */
      get cardContextMenuEntries() {
        return [...this.system.cardContextMenuEntries];
      }

      /** @inheritDoc */
      get embedActions() {
        return { ...super.embedActions, ...this.system.embedActions };
      }

      /** @inheritDoc */
      get embedIcons() {
        return [...super.embedIcons, this.system.embedIcons];
      }

      get embedParts() {
        return { ...super.embedParts, ...this.system.embedParts };
      }

      /** @inheritDoc */
      get metadata() {
        return this.system.constructor.metadata;
      }

      /** @inheritDoc */
      get nameString() {
        return this.system.nameString;
      }

      /** @inheritDoc */
      async _preCreate(data, options, user) {
        if (!data.img) {
          this.updateSource({
            img: systemPath(`icons/documents/${data.type}.svg`),
          });
        }
        return super._preCreate(data, options, user);
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
       * @returns {TeriockAbility[]}
       * @abstract
       */
      getAbilities() {
        return [];
      }

      /**
       * @inheritDoc
       * @returns {TeriockProperty[]}
       * @abstract
       */
      getProperties() {
        return [];
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
              macroUuids = macroUuids.filter((uuid) =>
                effect.changes
                  .filter((c) => c.key === `system.hookedMacros.${pseudoHook}`)
                  .map((c) => c.value)
                  .includes(uuid),
              );
            }
            for (const macroUuid of macroUuids) {
              /** @type {TeriockMacro} */
              const macro = await fromUuid(macroUuid);
              if (macro) {
                await macro.execute({
                  actor: this,
                  data: data,
                });
              }
            }
          }
        }
        if (this.documentName !== "Actor" && this.actor) {
          await this.actor.hookCall(pseudoHook, data, effect, skipCall);
        }
        return /** @type {Teriock.HookData.BaseHookData} */ data;
      }

      /** @inheritDoc */
      prepareData() {
        super.prepareData();
      }

      /** @inheritDoc */
      prepareSpecialData() {
        this.system.prepareSpecialData();
      }

      /** @inheritDoc */
      toDragData() {
        const dragData = super.toDragData();
        dragData.systemType = this.type;
        return dragData;
      }

      /** @inheritDoc */
      async toggleDisabled() {
        await this.update({ "system.disabled": !this.system.disabled });
      }
    }
  );
}
