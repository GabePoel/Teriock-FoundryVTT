import { bindCommonActions } from "../../../applications/shared/_module.mjs";
import { TeriockContextMenu } from "../../../applications/ux/_module.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { toTitleCase } from "../../../helpers/string.mjs";

/**
 * Mixin that provides support for embedding as a card.
 * @param {typeof ClientDocument} Base
 * @constructor
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
       * @returns {Record<string, function>}
       */
      get embedActions() {
        const actions = {
          openDoc: async () => this.sheet.render(true),
        };
        for (const embedIcon of this.embedIcons) {
          if (embedIcon.action && embedIcon.callback) {
            actions[embedIcon.action] = embedIcon.callback;
          }
        }
        return actions;
      }

      /**
       * Interactive icons to display in embedded elements.
       * @returns {Teriock.EmbedData.EmbedIcon[]}
       */
      get embedIcons() {
        return [];
      }

      /**
       * Parts that will be passed into a handlebars helper to asynchronously make an embedded element.
       * @returns {Teriock.EmbedData.EmbedParts}
       */
      get embedParts() {
        return {
          title: this.name,
          img: this.img,
          subtitle: toTitleCase(this.documentName),
          text: this.collectionName,
          uuid: this.uuid,
          makeTooltip: false,
          openable: true,
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
          const html = await foundry.applications.handlebars.renderTemplate(
            systemPath("templates/ui-templates/block.hbs"),
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
        const menuEntries = this.cardContextMenuEntries;
        if (menuEntries) {
          new TeriockContextMenu(
            element,
            ".teriock-block",
            this.cardContextMenuEntries,
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
              Object.keys(this.embedActions).includes(
                actionButton.dataset.action,
              )
            ) {
              await this.embedActions[actionButton.dataset.action](
                event,
                relative,
              );
              if (relative && relative.isViewer) {
                await relative.sheet.render();
              }
              if (relative?.parent && relative.isViewer) {
                await relative.parent.sheet.render();
              }
            }
          }
        });
      }
    }
  );
}
