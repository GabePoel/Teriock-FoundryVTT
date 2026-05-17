import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import TeriockChatMessage from "../chat-message/chat-message.mjs";
import * as mixins from "../mixins/_module.mjs";

const { RollTable } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * The Teriock RollTable implementation.
 * @extends {RollTable}
 * @mixes BaseDocument
 * @mixes UsableDocument
 * @implements {Teriock.Documents.RollTableInterface}
 */
export default class TeriockRollTable extends mixClasses(
  RollTable,
  mixins.BaseDocumentMixin,
  mixins.UsableDocumentMixin,
) {
  /**
   * All the documents in the results of this table.
   * @return {Promise<TeriockDocument[]>}
   */
  async getAllContents() {
    const out = await this.getContents();
    const allDocs = [...out.filter(d => !["RollTable", "Folder"].includes(d.documentName))];
    for (const d of out) {
      if (["RollTable", "Folder"].includes(d.documentName)) {
        const toAdd = await d.getAllContents();
        allDocs.push(...toAdd);
      }
    }
    return allDocs;
  }

  /**
   * The documents in the results of this table.
   * @return {Promise<TeriockDocument[]>}
   */
  async getContents() {
    const out = await Promise.all(
      this.results.filter(r => r.type === "document").map(r => foundry.utils.fromUuid(r.documentUuid)),
    );
    return out.filter(Boolean);
  }

  /**
   * @inheritDoc
   * @param {TeriockTableResult[]} results
   * @param {object} [options]
   * @param {BaseRoll} [options.roll]
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
        flavor: _loc(flavorKey, {
          number: results.length,
          name: foundry.utils.escapeHTML(this.name),
        }),
        rolls: [],
        sound: roll ? CONFIG.sounds.dice : null,
        speaker: TeriockChatMessage.getSpeaker(),
        system: {
          activations: teriock.data.pseudoDocuments.abstract.PseudoDocument.toCollectionObject(
            (await Promise.all(results.map(r => r.getActivations()))).flat(),
          ),
          avatar: TeriockChatMessage.getSpeakerActor(TeriockChatMessage.getSpeaker())?.img,
          panels: await Promise.all(results.map(r => r.getPanelParts())),
        },
      },
      messageData,
    );
    if (this.displayRoll && roll) messageData.rolls.push(roll);
    messageData.system.panels.forEach(panel => {
      panel.blocks.push({
        classes: TERIOCK.display.panel.classes.derived,
        text: this.description,
        title: this.name,
      });
    });
    messageData.system.panels = await TeriockTextEditor.enrichPanels(messageData.system.panels);
    return TeriockChatMessage.create(messageData, messageOptions);
  }

  /** @inheritDoc */
  async use(options = {}) {
    await this.draw(options);
  }
}
