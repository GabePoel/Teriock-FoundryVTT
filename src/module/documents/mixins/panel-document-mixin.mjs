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
      /** @returns {Teriock.MessageData.MessagePanel} */
      get panelParts() {
        return {
          name: this.nameString || this.name,
          image: systemPath("icons/documents/uncertainty.svg"),
          icon: "file",
          blocks: [],
          bars: [],
        };
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
