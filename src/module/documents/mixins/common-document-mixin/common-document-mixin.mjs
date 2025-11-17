import { bindCommonActions } from "../../../applications/shared/_module.mjs";
import { TeriockContextMenu } from "../../../applications/ux/_module.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { TeriockActor } from "../../_module.mjs";

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
     * @mixin
     */
    class CommonDocument extends Base {
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

      /**
       * Can this be viewed?
       * @returns {boolean}
       */
      get isViewer() {
        return this.permission >= 2;
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
      onEmbed(element) {
        bindCommonActions(element);
        const menuEntries = this.system.cardContextMenuEntries;
        if (menuEntries) {
          new TeriockContextMenu(
            element,
            ".tcard",
            this.system.cardContextMenuEntries,
            {
              eventName: "contextmenu",
              jQuery: false,
              fixed: true,
            },
          );
        }
        element.addEventListener("click", async (event) => {
          const target = /** @type {HTMLElement} */ event.target;
          const card =
            /** @type {HTMLElement} */ target.closest("[data-relative]");
          const relativeUuid = card?.dataset.relative;
          let relative;
          if (relativeUuid) {
            relative = await fromUuid(relativeUuid);
          }
          const actionButton =
            /** @type {HTMLElement} */ target.closest("[data-action]");
          if (actionButton) {
            event.stopPropagation();
            if (
              Object.keys(this.system.embedActions).includes(
                actionButton.dataset.action,
              )
            ) {
              await this.system.embedActions[actionButton.dataset.action](
                event,
              );
              if (relative) {
                await relative.sheet.render();
              }
            }
          }
        });
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
