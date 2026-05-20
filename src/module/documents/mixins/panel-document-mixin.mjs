import { TeriockChatMessage } from "../_module.mjs";
import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { systemPath } from "../../helpers/path.mjs";

/**
 * @param {typeof BaseDocument} Base
 */
export default function PanelDocumentMixin(Base) {
  return (
    /**
     * @mixes BaseDocument
     * @mixin
     */
    class PanelDocument extends Base {
      /** @inheritDoc */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, { tooltip: true });
      }

      /**
       * Bind listeners to collapse panel elements.
       * @param {HTMLElement} element
       */
      static bindPanelListeners(element) {
        element.querySelectorAll("[data-action='toggle-collapse']").forEach(el => {
          el.addEventListener("click", e => {
            e.stopPropagation();
            const target = /** @type {HTMLElement} */ e.target;
            const collapsable = /** @type {HTMLElement} */ target.closest(".collapsable");
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
        const selector = options.autoCollapse ? "collapsable:not([data-no-auto-toggle])" : "collapsable";
        if (options.collapsePanel) {
          element.querySelectorAll(`.teriock-panel.${selector}`).forEach(el => {
            el.classList.toggle("collapsed", true);
          });
        }
        if (options.collapseAssociation) {
          element.querySelectorAll(`.teriock-panel-association.${selector}`).forEach(el => {
            el.classList.toggle("collapsed", true);
          });
        }
        if (options.collapseAll) {
          element.querySelectorAll(`.${selector}`).forEach(el => {
            el.classList.toggle("collapsed", true);
          });
        }
      }

      /** @inheritDoc */
      async _buildEmbedHTML(config, options = {}) {
        if (config.values.includes("panel")) {
          if (!config.label) {
            config.caption = false;
          }
          return foundry.utils.parseHTML(
            await TeriockTextEditor.makeTooltip(await this.getPanelParts(), {
              noAssociations: config.values.includes("noAssociations"),
              noBars: config.values.includes("noBars"),
              noBlocks: config.values.includes("noBlocks"),
              relativeTo: this,
            }),
          );
        }
        return super._buildEmbedHTML(config, options);
      }

      /** @returns {Promise<Partial<Teriock.Messages.MessagePanel>>} */
      async getPanelParts() {
        const parts = {
          bars: [],
          blocks: [],
          icon: TERIOCK.display.icons.ui.document,
          image: systemPath("icons/documents/uncertainty.svg"),
          name: this.fullName || this.name,
        };
        if (typeof this.system?.getPanelParts === "function") {
          Object.assign(parts, await this.system.getPanelParts());
        }
        return parts;
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
          options?.actor || this.actor || TeriockChatMessage.getSpeakerActor(TeriockChatMessage.getSpeaker());
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
        return TeriockChatMessage.create(messageData, { defaultMode: true });
      }

      /** @returns {Promise<Teriock.Messages.MessagePanel>} */
      async toPanel() {
        const parts = await this.getPanelParts();
        return await TeriockTextEditor.enrichPanel(parts, { relativeTo: this });
      }

      /** @inheritDoc */
      async toTooltip() {
        return await TeriockTextEditor.makeTooltip(await this.getPanelParts(), {
          relativeTo: this,
        });
      }
    }
  );
}
