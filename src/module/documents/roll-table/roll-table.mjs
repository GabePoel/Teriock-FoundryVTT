import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import TeriockChatMessage from "../chat-message/chat-message.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { RollTable } = foundry.documents;

/**
 * The Teriock {@link RollTable} implementation.
 * @extends {RollTable}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @property {Collection<ID<TeriockTableResult>, TeriockTableResult>} results
 */
export default class TeriockRollTable extends BaseDocumentMixin(RollTable) {
  /** @inheritDoc */
  static async fromFolder(folder, options = {}) {
    const table = await super.fromFolder(folder, options);
    if (game.settings.get("teriock", "developerMode") && game.user.isGM) {
      await table.update({
        description: "",
      });
    }
    return table;
  }

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
          panels: results.map((r) => r.messageParts),
        },
      },
      messageData,
    );
    if (roll) {
      messageData.rolls.push(roll);
    }
    messageData.system.panels = await TeriockTextEditor.enrichPanels(
      messageData.system.panels,
    );
    return TeriockChatMessage.create(messageData, messageOptions);
  }
}
