import { TeriockChatMessage } from "../_module.mjs";
import { PanelSheet } from "../../applications/sheets/utility-sheets/_module.mjs";
import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { toId } from "../../helpers/string.mjs";

/**
 * @import { PanelEnrichmentOptions } from "../../applications/ux/text-editor.mjs"
 */

/**
 * @template {Constructor<BaseDocument>} T
 * @param {T} Base
 */
export default function PanelDocumentMixin(Base) {
  return (
    /**
     * @extends {BaseDocument}
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
              secrets: this.isOwner,
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
          _id: foundry.utils.randomID(),
          bars: [],
          blocks: [],
          icon: TERIOCK.display.icons.ui.document,
          img: this.img ?? systemPath("icons/documents/uncertainty.svg"),
          name: this.fullName || this.name,
          uuid: this.uuid,
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
        const panel = await this.getPanelParts();
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

      /** @inheritDoc */
      async toTooltip() {
        return TeriockTextEditor.makeTooltip(await this.getPanelParts(), { relativeTo: this, secrets: this.isOwner });
      }
    }
  );
}
