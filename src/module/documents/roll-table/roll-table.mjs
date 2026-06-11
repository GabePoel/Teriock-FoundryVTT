import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { tableResultSort } from "../../helpers/sort.mjs";
import TeriockChatMessage from "../chat-message/chat-message.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { RollTable } = foundry.documents;

/**
 * The Teriock RollTable implementation.
 * @extends {RollTable}
 * @mixes BaseDocument
 * @mixes UsableDocument
 * @mixes PanelDocument
 * @implements {Teriock.Documents.RollTableInterface}
 */
export default class TeriockRollTable
  extends mixClasses(
    RollTable,
    documentMixins.BaseDocumentMixin,
    documentMixins.UsableDocumentMixin,
    documentMixins.PanelDocumentMixin,
  )
{
  /**
   * Format a roll table result range for display in associations.
   * @param {number[]} [range]
   * @returns {string}
   */
  static formatResultRange(range) {
    if (!range?.length) { return ""; }
    const [min, max] = range;
    if (min === max) { return String(min); }
    return `${min}\u2013${max}`;
  }

  /**
   * All the documents in the results of this table.
   * @return {Promise<TeriockDocument[]>}
   */
  async getAllContents() {
    const out = await this.getContents();
    const allDocs = [...out.filter(d => !["Folder", "RollTable"].includes(d.documentName))];
    for (const d of out) {
      if (["Folder", "RollTable"].includes(d.documentName)) {
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

  /** @inheritDoc */
  async getPanelParts() {
    const results = tableResultSort([...this.results]);
    return Object.assign(await super.getPanelParts(), {
      associations: results.length
        ? [{
          cards: results.map(r => ({
            badge: TeriockRollTable.formatResultRange(r.range),
            id: r._id,
            img: r.img,
            makeTooltip: true,
            name: r.name,
            type: r.documentName,
            uuid: r.uuid,
          })),
          icon: TERIOCK.display.icons.document.tableResult,
          title: _loc("TERIOCK.DOCUMENTS.result.plural"),
        }]
        : [],
      bars: [{
        icon: TERIOCK.display.icons.ui.formula,
        label: _loc("TERIOCK.TERMS.Common.formula"),
        wrappers: [this.formula ?? ""],
      }],
      blocks: [{ text: this.description, title: this.getFieldForProperty("description").label }],
      icon: TERIOCK.display.icons.document.table,
    });
  }

  /**
   * @inheritDoc
   * @param {TeriockTableResult[]} results
   * @param {object} [options]
   * @param {BaseRoll} [options.roll]
   * @param {Partial<Teriock.Data.ChatMessageData>} [options.messageData]
   * @param {object} messageOptions
   */
  async toMessage(results, { messageData = {}, messageOptions = {}, roll }) {
    messageOptions.messageMode ??= game.settings.get("core", "messageMode");
    const flavorKey = `TABLE.DrawFlavor${results.length > 1 ? "Plural" : ""}`;
    messageData = foundry.utils.mergeObject({
      author: game.user.id,
      flags: { "core.RollTable": this.id },
      flavor: _loc(flavorKey, { name: foundry.utils.escapeHTML(this.name), number: results.length }),
      rolls: [],
      sound: roll ? CONFIG.sounds.dice : null,
      speaker: TeriockChatMessage.getSpeaker(),
      system: {
        _src: this.uuid,
        activations: teriock.data.pseudoDocuments.abstract.PseudoDocument.toCollectionObject(
          (await Promise.all(results.map(r => r.getActivations()))).flat(),
        ),
        avatar: TeriockChatMessage.getSpeakerActor(TeriockChatMessage.getSpeaker())?.img,
        panels: await Promise.all(results.map(r => r.getPanelParts())),
      },
    }, messageData);
    if (this.displayRoll && roll) { messageData.rolls.push(roll); }
    messageData.system.panels.forEach(panel => {
      panel.blocks.push({ classes: TERIOCK.display.panel.classes.derived, text: this.description, title: this.name });
    });
    messageData.system.panels = await TeriockTextEditor.enrichPanels(messageData.system.panels);
    return TeriockChatMessage.create(messageData, messageOptions);
  }

  /** @inheritDoc */
  async use(options = {}) {
    await this.draw(options);
  }
}
