import { TeriockTextEditor } from "../../applications/ux/_module.mjs";
import { getRollIcon } from "../../helpers/utils.mjs";
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

  /** @inheritDoc */
  async toMessage(results, { roll, messageData = {}, messageOptions = {} }) {
    messageOptions.rollMode ??= game.settings.get("core", "rollMode");
    const flavorKey = `TABLE.DrawFlavor${results.length > 1 ? "Plural" : ""}`;
    messageData = foundry.utils.mergeObject(
      {
        flavor: game.i18n.format(flavorKey, {
          number: results.length,
          name: foundry.utils.escapeHTML(this.name),
        }),
        author: game.user.id,
        speaker: TeriockChatMessage.getSpeaker(),
        rolls: [],
        sound: roll ? CONFIG.sounds.dice : null,
        flags: { "core.RollTable": this.id },
        system: {
          avatar: TeriockChatMessage.getSpeakerActor(
            TeriockChatMessage.getSpeaker(),
          )?.img,
          panels: [],
        },
      },
      messageData,
    );
    if (roll) {
      messageData.rolls.push(roll);
    }
    /** @type {Teriock.MessageData.MessagePanel} */
    const panel = {
      name: this.name,
      image: this.img,
      icon: "table-list",
      blocks: [
        {
          title: "Table Description",
          text: this.description,
        },
      ],
      bars: [
        {
          label: "Roll Formula",
          wrappers: [this.formula],
          icon: "fa-" + getRollIcon(this.formula),
        },
      ],
      label: "Rollable Table",
      associations: [
        {
          title: "Results",
          icon: "table-rows",
          cards: [],
        },
      ],
    };
    for (const r of results) {
      if (r.description) {
        panel.blocks.push({
          title: r.name,
          text: r.description,
        });
      }
      const card = {
        name: r.name,
        img: r.icon,
        type: "base",
      };
      if (r.documentUuid) {
        const index = fromUuidSync(r.documentUuid);
        Object.assign(card, {
          uuid: r.documentUuid,
          name: index.nameString || index.name || r.name,
          img: index.img || r.icon,
          type: index.type || "base",
          makeTooltip: true,
          id: index._id,
          draggable: true,
        });
      }
      panel.associations[0].cards.push(card);
    }
    messageData.system.panels.push(await TeriockTextEditor.enrichPanel(panel));
    return TeriockChatMessage.create(messageData, messageOptions);
  }
}
