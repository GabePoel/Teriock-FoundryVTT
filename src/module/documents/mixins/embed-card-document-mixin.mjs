import { bindCommonActions } from "../../applications/shared/_module.mjs";
import { TeriockContextMenu, TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { toTitleCase } from "../../helpers/string.mjs";

/**
 * Mixin that provides support for embedding as a card.
 * @param {typeof BaseDocument} Base
 */
export default function EmbedCardDocumentMixin(Base) {
  return (
    /**
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
          const html = await TeriockTextEditor.renderTemplate("teriock/ui/block", embedContext);
          return foundry.utils.parseHTML(html);
        }
      }

      /** @inheritDoc */
      onEmbed(element) {
        bindCommonActions(element);
        const isEmbedded = element.tagName === "DOCUMENT-EMBED";
        // Mutate block image to remove signs that this could be usable
        if (isEmbedded) {
          const blockImage = element.querySelector(".teriock-block-image");
          if (blockImage) {
            blockImage.removeAttribute("data-tooltip");
            blockImage.classList.remove("usable");
          }
        }
        const addCallbacks =
          element.classList.contains("teriock-block") ||
          !!element.querySelector(`.teriock-block[data-uuid="${this.uuid}"]`);
        if (addCallbacks) {
          const relativeUuid = element.dataset.relative ?? element.querySelector("[data-relative]")?.dataset.relative;
          fromUuid(relativeUuid).then(relative => {
            for (const [type, callback] of Object.entries({
              click: "primary",
              contextmenu: "secondary",
            })) {
              // The only callback that always gets added is `openDoc`
              element.addEventListener(type, async ev => {
                const target = /** @type {HTMLElement} */ ev.target;
                const el = /** @type {HTMLElement} */ target.closest("[data-action]");
                if (el) {
                  const action = el.dataset.action;
                  const fn = this.embedActions[action][callback];
                  if (!fn || (isEmbedded && action !== "openDoc")) return;
                  ev.stopImmediatePropagation();
                  ev.preventDefault();
                  if (["openDoc", "useDoc"].includes(action) || game.teriock.checkEditable(relative)) {
                    await fn(ev, relative);
                  }
                }
              });
            }
            // Only add context menu entries if this is actually in a document and not just an embedded HTML element
            if (isEmbedded) return;
            const menuEntries = this.getCardContextMenuEntries(relative);
            if (!menuEntries) return;
            new TeriockContextMenu(element, ".teriock-block", menuEntries, {
              eventName: "contextmenu",
              jQuery: false,
              fixed: true,
            });
          });
        }
        super.onEmbed(element);
      }
    }
  );
}
