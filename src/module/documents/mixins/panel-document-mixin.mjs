import { TeriockChatMessage } from "../_module.mjs";
import { PanelSheet } from "../../applications/sheets/utility-sheets/_module.mjs";
import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { toId } from "../../helpers/string.mjs";

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

      /** @inheritDoc */
      async _buildEmbedHTML(config, options = {}) {
        if (config.values.includes("panel")) {
          if (!config.label) { config.caption = false; }
          const parts = await this.getPanelParts();
          parts._id = toId(
            [options?.relativeTo?.uuid, this.uuid ?? this.id, this.forcedIdentifier].filter(Boolean).join("-"),
            { hash: true },
          );
          return foundry.utils.parseHTML(
            await TeriockTextEditor.makeTooltip(parts, {
              noAssociations: config.values.includes("noAssociations"),
              noBars: config.values.includes("noBars"),
              noBlocks: config.values.includes("noBlocks"),
              relativeTo: this,
            }),
          );
        }
        return super._buildEmbedHTML(config, options);
      }

      /**
       * Parts of a panel.
       * @returns {Promise<Partial<Teriock.Panels.PanelParts>>}
       */
      async getPanelParts() {
        const parts = {
          bars: [],
          blocks: [],
          icon: TERIOCK.display.icons.ui.document,
          image: this.img ?? systemPath("icons/documents/uncertainty.svg"),
          name: this.fullName || this.name,
        };
        if (typeof this.system?.getPanelParts === "function") { Object.assign(
            parts,
            await this.system.getPanelParts(),
          ); }
        return parts;
      }

      /**
       * Open this document as a panel sheet.
       * @returns {Promise<void>}
       */
      async openPanelSheet() {
        let panelSheet = Object.values(this.apps).find((a) => a instanceof PanelSheet);
        if (!panelSheet) { panelSheet = new PanelSheet({ document: this }); }
        await panelSheet.render(true);
      }

      /** @inheritDoc */
      async toMessage(options = {}) {
        const panel = await this.toPanel();
        const actor = options?.actor || this.actor
          || TeriockChatMessage.getSpeakerActor(TeriockChatMessage.getSpeaker());
        const messageData = {
          speaker: TeriockChatMessage.getSpeaker({ actor }),
          system: {
            _src: this.uuid,
            bars: [],
            blocks: [],
            buttons: [],
            extraContent: "",
            panels: [panel],
            source: null,
            tags: [],
          },
          type: "interactive",
        };
        return TeriockChatMessage.create(messageData, { defaultMode: true });
      }

      /** @returns {Promise<Teriock.Panels.PanelParts>} */
      async toPanel() {
        const parts = await this.getPanelParts();
        return TeriockTextEditor.enrichPanel(parts, { relativeTo: this });
      }

      /** @inheritDoc */
      async toTooltip() {
        return TeriockTextEditor.makeTooltip(await this.getPanelParts(), { relativeTo: this });
      }
    }
  );
}
