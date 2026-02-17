import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { TeriockChatMessage } from "../_module.mjs";

/**
 * @param {typeof ClientDocument} Base
 */
export default function PanelDocumentMixin(Base) {
  return (
    /**
     * @extends ClientDocument
     * @mixes BaseDocument
     * @mixin
     */
    class PanelDocument extends Base {
      /** @inheritDoc */
      static get documentMetadata() {
        const metadata = super.documentMetadata;
        metadata.tooltip = true;
        return metadata;
      }

      /**
       * Bind listeners to collapse panel elements.
       * @param {HTMLElement} element
       */
      static bindPanelListeners(element) {
        element
          .querySelectorAll("[data-action='toggle-collapse']")
          .forEach((el) => {
            el.addEventListener("click", (e) => {
              e.stopPropagation();
              const target = /** @type {HTMLElement} */ e.target;
              const collapsable =
                /** @type {HTMLElement} */ target.closest(".collapsable");
              collapsable.classList.toggle("collapsed");
              collapsable.dataset.noAutoToggle = "true";
            });
          });
      }

      /**
       * Toggle collapse state of panel elements.
       * @param {HTMLElement} element
       * @param {object} [options]
       * @param {boolean} [options.autoCollapse]
       * @param {boolean} [options.collapseAll]
       * @param {boolean} [options.collapsePanel]
       * @param {boolean} [options.collapseAssociation]
       */
      static toggleCollapse(element, options = {}) {
        const selector = options.autoCollapse
          ? "collapsable:not([data-no-auto-toggle])"
          : "collapsable";
        if (options.collapsePanel) {
          element
            .querySelectorAll(`.teriock-panel.${selector}`)
            .forEach((el) => {
              el.classList.toggle("collapsed", true);
            });
        }
        if (options.collapseAssociation) {
          element
            .querySelectorAll(`.teriock-panel-association.${selector}`)
            .forEach((el) => {
              el.classList.toggle("collapsed", true);
            });
        }
        if (options.collapseAll) {
          element.querySelectorAll(`.${selector}`).forEach((el) => {
            el.classList.toggle("collapsed", true);
          });
        }
      }

      /** @returns {Teriock.MessageData.MessagePanel} */
      get panelParts() {
        return {
          name: this.nameString || this.name,
          image: systemPath("icons/documents/uncertainty.svg"),
          icon: TERIOCK.display.icons.ui.document,
          blocks: [],
          bars: [],
        };
      }

      /** @inheritDoc */
      async _buildEmbedHTML(config, options = {}) {
        if (config.values.includes("panel")) {
          if (!config.label) config.caption = false;
          return foundry.utils.parseHTML(
            await TeriockTextEditor.makeTooltip(this.panelParts, {
              noBlocks: config.values.includes("noBlocks"),
              noBars: config.values.includes("noBars"),
              noAssociations: config.values.includes("noAssociations"),
            }),
          );
        }
        return super._buildEmbedHTML(config, options);
      }

      /** @inheritDoc */
      onEmbed(element) {
        PanelDocument.bindPanelListeners(element);
        super.onEmbed(element);
      }

      /** @inheritDoc */
      async toMessage(options = {}) {
        const panel = await this.toPanel();
        const actor =
          options?.actor ||
          this.actor ||
          TeriockChatMessage.getSpeakerActor(TeriockChatMessage.getSpeaker());
        const messageData = {
          speaker: TeriockChatMessage.getSpeaker({
            actor: actor,
          }),
          system: {
            avatar: actor?.img,
            bars: [],
            blocks: [],
            buttons: [],
            extraContent: "",
            panels: [panel],
            source: null,
            tags: [],
          },
        };
        TeriockChatMessage.applyRollMode(
          messageData,
          game.settings.get("core", "rollMode"),
        );
        return TeriockChatMessage.create(messageData);
      }

      /** @returns {Promise<Teriock.MessageData.MessagePanel>} */
      async toPanel() {
        let parts = this.panelParts;
        // If this is part of a preview, it won't have a real UUID.
        if (this.getFlag("teriock", "previewUuid")) {
          const doc = await fromUuid(this.getFlag("teriock", "previewUuid"));
          if (doc) {
            parts = doc.panelParts;
          }
        }
        return await TeriockTextEditor.enrichPanel(parts, { relativeTo: this });
      }

      /** @inheritDoc */
      async toTooltip() {
        return await TeriockTextEditor.makeTooltip(this.panelParts, {
          relativeTo: this,
        });
      }
    }
  );
}
