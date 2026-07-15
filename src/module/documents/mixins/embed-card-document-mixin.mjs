import { TeriockContextMenu, TeriockTextEditor } from "../../applications/ux/_module.mjs";

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
      get _embedActions() {
        const actions = { openDoc: { primary: async () => this.sheet.render(true) } };
        for (
          const embedIcon of this._embedIcons
        ) { if (embedIcon.action && embedIcon.onClick) { actions[embedIcon.action] = { primary: embedIcon.onClick }; } }
        return actions;
      }

      /**
       * Interactive icons to display in embedded elements.
       * @returns {Partial<Teriock.EmbedData.EmbedIcon>[]}
       */
      get _embedIcons() {
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
          subtitle: this.type ? _loc(`TYPES.${this.documentName}.${this.type}`) : _loc(`DOCUMENT.${this.documentName}`),
          text: this.collectionName,
          title: this.name,
          uuid: this.uuid,
        };
      }

      /** @inheritDoc */
      async _buildEmbedHTML(config, options = {}) {
        const content = await super._buildEmbedHTML(config, options);
        if (content) { return content; }

        const embedContext = foundry.utils.mergeObject(this.embedParts, config);
        if (options.relativeTo) { embedContext.relative = options.relativeTo.uuid; }
        const html = await TeriockTextEditor.renderTemplate("teriock/ui/block", embedContext);
        return foundry.utils.parseHTML(html);
      }

      /** @inheritDoc */
      onEmbed(element) {
        const isEmbedded = element.tagName === "DOCUMENT-EMBED";
        // Mutate block image to remove signs that this could be usable
        if (isEmbedded) {
          const blockImage = element.querySelector(".teriock-block-image");
          if (blockImage) {
            blockImage.removeAttribute("data-tooltip");
            blockImage.classList.remove("usable");
          }
        }
        const addCallbacks = element.classList.contains("teriock-block")
          || Boolean(element.querySelector(`.teriock-block[data-uuid="${this.uuid}"]`));
        if (addCallbacks) {
          const relativeUuid = element.dataset.relative ?? element.querySelector("[data-relative]")?.dataset.relative;
          fromUuid(relativeUuid).then(relative => {
            for (const [type, callback] of Object.entries({ click: "primary", contextmenu: "secondary" })) {
              // The only callback that always gets added is `openDoc`
              element.addEventListener(type, async ev => {
                const target = /** @type {HTMLElement} */ ev.target;
                const el = /** @type {HTMLElement} */ target.closest("[data-action]");
                if (el) {
                  const action = el.dataset.action;
                  // The action may belong to the sheet rather than to this document, in which case leave it alone.
                  const fn = this._embedActions[action]?.[callback];
                  if (!fn || (isEmbedded && action !== "openDoc")) { return; }
                  ev.stopImmediatePropagation();
                  ev.preventDefault();
                  if (["openDoc", "useDoc"].includes(action) || game.teriock.checkEditable(relative)) {
                    await fn(ev, relative);
                  }
                }
              });
            }
            // Only add context menu entries if this is actually in a document and not just an embedded HTML element
            if (isEmbedded) { return; }
            const menuEntries = this.getCardContextMenuEntries(relative);
            if (!menuEntries) { return; }
            new TeriockContextMenu(element, ".teriock-block", menuEntries, {
              eventName: "contextmenu",
              fixed: true,
              jQuery: false,
            });
          });
        }
        super.onEmbed(element);
      }
    }
  );
}
