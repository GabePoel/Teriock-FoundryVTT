import { bindCommonActions } from "../../../applications/shared/_module.mjs";
import { TeriockContextMenu } from "../../../applications/ux/_module.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { toTitleCase } from "../../../helpers/string.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";

/**
 * Mixin that provides support for embedding as a card.
 * @param {typeof ClientDocument} Base
 * @constructor
 */
export default function EmbedCardDocumentMixin(Base) {
  return (
    /**
     * @extends ClientDocument
     * @mixin
     */
    class EmbedCardDocument extends Base {
      /**
       * Context menu entries to display for cards that represent this document.
       * @returns {Teriock.Foundry.ContextMenuEntry[]}
       */
      get cardContextMenuEntries() {
        return [
          {
            name: "Open Parent",
            icon: makeIcon("arrow-up-right-from-square", "contextMenu"),
            callback: async () => await this.parent.sheet.render(true),
            condition: () => this.parent && this.parent.permission >= 2,
          },
          {
            name: "Delete",
            icon: makeIcon("trash", "contextMenu"),
            callback: async () => {
              await this.delete();
            },
            condition: () => this.isOwner,
            group: "document",
          },
        ];
      }

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

      /**
       * Can this be viewed?
       * @returns {boolean}
       */
      get isViewer() {
        return this.permission >= 2;
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
            systemPath("templates/embed-templates/embed-card.hbs"),
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
            ".tcard",
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
              if (relative && relative.permission >= 2) {
                await relative.sheet.render();
              }
              if (relative?.parent && relative.permission >= 2) {
                await relative.parent.sheet.render();
              }
            }
          }
        });
      }
    }
  );
}
