import { makeIcon } from "../../../../../helpers/utils.mjs";
import { TeriockContextMenu } from "../../../../ux/_module.mjs";

/**
 * @param {typeof TeriockDocumentSheet} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {GenericCommon} document
     */
    class MacroCommonSheetPart extends Base {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          unlinkMacro: this._onUnlinkMacro,
        },
      };

      /**
       * Unlink a macro from this document.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onUnlinkMacro(_event, target) {
        if (this.isEditable) {
          if (this.document.system.macros) {
            const uuidElement =
              /** @type {HTMLElement} */ target.closest("[data-uuid]");
            const uuid = uuidElement.dataset.uuid;
            await this.document.system.unlinkMacro(uuid);
          } else {
            ui.notifications.warn("Sheet must be editable to unlink macro.");
          }
        }
      }

      /**
       * Connects macro context menus.
       */
      _connectMacroContextMenus() {
        const cards = this.element.querySelectorAll(
          ".teriock-block.macro-card",
        );
        cards.forEach(
          /** @param {HTMLElement} target */ (target) => {
            new TeriockContextMenu(
              target,
              ".teriock-block.macro-card",
              [
                {
                  name: "Unlink",
                  icon: makeIcon("link-slash", "contextMenu"),
                  callback: async () => {
                    const uuid = target.dataset.uuid;
                    await this.document.system.unlinkMacro(uuid);
                  },
                  condition: () => this.isEditable && this.document.isOwner,
                  group: "document",
                },
                {
                  name: "Change Run Hook",
                  icon: makeIcon("gear-code", "contextMenu"),
                  callback: async () => {
                    const uuid = target.dataset.uuid;
                    await this.document.system.changeMacroRunHook(uuid);
                  },
                  condition: () =>
                    this.isEditable &&
                    this.document.isOwner &&
                    target.classList.contains("hooked-macro-card"),
                  group: "document",
                },
              ],
              {
                eventName: "contextmenu",
                jQuery: false,
                fixed: true,
              },
            );
          },
        );
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this._connectMacroContextMenus();
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        await this._prepareMacroContext(context);
        return context;
      }

      /**
       * Prepare any macros that should be part of the context.
       * @param {object} context
       * @returns {Promise<void>}
       */
      async _prepareMacroContext(context) {
        if (this.document.system.macros) {
          context.macros = await Promise.all(
            Array.from(
              this.document.system.macros.map(async (uuid) => {
                let macro = await fromUuid(uuid);
                if (!macro) {
                  macro = {
                    name: "Broken Macro",
                    uuid: uuid,
                    img: "icons/svg/hazard.svg",
                  };
                }
                return macro;
              }),
            ),
          );
        } else {
          context.macros = [];
        }
      }
    }
  );
};
