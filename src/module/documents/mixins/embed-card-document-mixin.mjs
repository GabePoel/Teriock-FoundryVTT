import { bindCommonActions } from "../../applications/shared/_module.mjs";
import {
  TeriockContextMenu,
  TeriockTextEditor,
} from "../../applications/ux/_module.mjs";
import { toTitleCase } from "../../helpers/string.mjs";

/**
 * Mixin that provides support for embedding as a card.
 * @param {typeof ClientDocument} Base
 */
export default function EmbedCardDocumentMixin(Base) {
  return (
    /**
     * @extends ClientDocument
     * @mixes BaseDocument
     * @mixin
     */
    class EmbedCardDocument extends Base {
      /**
       * Actions that can fire from an embedded element representing this.
       * @returns {Record<string, Partial<Teriock.EmbedData.EmbedAction>>}
       */
      get embedActions() {
        const actions = {
          openDoc: { primary: async () => this.sheet.render(true) },
        };
        for (const embedIcon of this.embedIcons) {
          if (embedIcon.action && embedIcon.onClick) {
            actions[embedIcon.action] = { primary: embedIcon.onClick };
          }
        }
        return actions;
      }

      /**
       * Interactive icons to display in embedded elements.
       * @returns {Partial<Teriock.EmbedData.EmbedIcon>[]}
       */
      get embedIcons() {
        return [];
      }

      /**
       * Parts that will be passed into a handlebar helper to asynchronously make an embedded element.
       * @returns {Partial<Teriock.EmbedData.EmbedParts>}
       */
      get embedParts() {
        return {
          img: this.img,
          makeTooltip: false,
          openable: true,
          subtitle: toTitleCase(this.documentName),
          text: this.collectionName,
          title: this.name,
          uuid: this.uuid,
        };
      }

      /** @inheritDoc */
      async _buildEmbedHTML(config, options = {}) {
        const content = await super._buildEmbedHTML(config, options);
        if (content) {
          return content;
        } else {
          const embedContext = this.embedParts;
          if (options.relativeTo) {
            embedContext.relative = options.relativeTo.uuid;
          }
          const html = await TeriockTextEditor.renderTemplate(
            "teriock/ui/block",
            embedContext,
          );
          config.caption = false;
          config.cite = false;
          return foundry.utils.parseHTML(html);
        }
      }

      /** @inheritDoc */
      onEmbed(element) {
        bindCommonActions(element);
        const proceed =
          element.classList.contains("teriock-block") ||
          !!element.querySelector(`.teriock-block[data-uuid="${this.uuid}"]`);
        if (proceed) {
          const relativeUuid =
            element.querySelector("[data-relative]")?.dataset.relative;
          fromUuid(relativeUuid).then((relative) => {
            for (const [type, callback] of Object.entries({
              click: "primary",
              contextmenu: "secondary",
            })) {
              element.addEventListener(type, async (ev) => {
                const target = /** @type {HTMLElement} */ ev.target;
                const el =
                  /** @type {HTMLElement} */ target.closest("[data-action]");
                if (el) {
                  const action = el.dataset.action;
                  const fn = this.embedActions[action][callback];
                  if (!fn) return;
                  ev.stopImmediatePropagation();
                  ev.preventDefault();
                  await fn(ev, relative);
                  if (relative && relative.sheet?.isVisible) {
                    await relative.sheet.render();
                  }
                  if (relative?.parent && relative.parent.sheet?.isVisible) {
                    await relative.parent.sheet.render();
                  }
                  // Special handling for updating chat messages since they don't use sheets.
                  /** @see {TeriockChatMessage.renderHTML} */
                  if (relative?.documentName === "ChatMessage") {
                    await ui.chat.updateMessage(relative);
                  }
                }
              });
            }
            const menuEntries = this.getCardContextMenuEntries(relative);
            if (menuEntries) {
              new TeriockContextMenu(element, ".teriock-block", menuEntries, {
                eventName: "contextmenu",
                jQuery: false,
                fixed: true,
              });
            }
          });
        }
        super.onEmbed(element);
      }
    }
  );
}
