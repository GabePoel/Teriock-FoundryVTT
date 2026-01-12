import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { mix } from "../../helpers/utils.mjs";
import TeriockChatMessage from "../chat-message/chat-message.mjs";
import * as mixins from "../mixins/_module.mjs";

const { RollTable } = foundry.documents;

/**
 * The Teriock {@link RollTable} implementation.
 * @extends {RollTable}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @property {Collection<ID<TeriockTableResult>, TeriockTableResult>} results
 */
export default class TeriockRollTable extends mix(
  RollTable,
  mixins.BaseDocumentMixin,
) {
  /**
   * @inheritDoc
   * @param {TeriockTableResult[]} results
   * @param {object} [options]
   * @param {TeriockRoll} [options.roll]
   * @param {Partial<Teriock.Data.ChatMessageData>} [options.messageData]
   * @param {object} messageOptions
   */
  async toMessage(results, { roll, messageData = {}, messageOptions = {} }) {
    messageOptions.rollMode ??= game.settings.get("core", "rollMode");
    const flavorKey = `TABLE.DrawFlavor${results.length > 1 ? "Plural" : ""}`;
    messageData = foundry.utils.mergeObject(
      {
        author: game.user.id,
        flags: { "core.RollTable": this.id },
        flavor: game.i18n.format(flavorKey, {
          number: results.length,
          name: foundry.utils.escapeHTML(this.name),
        }),
        rolls: [],
        sound: roll ? CONFIG.sounds.dice : null,
        speaker: TeriockChatMessage.getSpeaker(),
        system: {
          avatar: TeriockChatMessage.getSpeakerActor(
            TeriockChatMessage.getSpeaker(),
          )?.img,
          panels: results.map((r) => r.panelParts),
        },
      },
      messageData,
    );
    if (roll) {
      messageData.rolls.push(roll);
    }
    messageData.system.panels.forEach((panel) => {
      panel.blocks.push({
        title: this.name,
        text: this.description,
        classes: "italic-display-field",
      });
    });
    messageData.system.panels = await TeriockTextEditor.enrichPanels(
      messageData.system.panels,
    );
    return TeriockChatMessage.create(messageData, messageOptions);
  }
}
