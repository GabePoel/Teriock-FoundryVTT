import { makeIcon, mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { TableResult } = foundry.documents;

/**
 * The Teriock {@link TableResult} implementation.
 * @extends {TableResult}
 * @extends {ClientDocument}
 * @mixes EmbedCardDocument
 * @mixes BaseDocument
 * @mixes PanelDocument
 */
export default class TeriockTableResult extends mix(
  TableResult,
  mixins.BaseDocumentMixin,
  mixins.PanelDocumentMixin,
  mixins.EmbedCardDocumentMixin,
) {
  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.makeTooltip = true;
    parts.subtitle = this.type;
    parts.text = this.parent.name || "";
    return parts;
  }

  /** @inheritDoc */
  get panelParts() {
    /** @type {Teriock.MessageData.MessagePanel} */
    const parts = super.panelParts;
    parts.icon = "table-rows";
    parts.label = "Table Result";
    parts.image = this.icon;
    parts.blocks.push({
      title: "Description",
      text: this.description,
    });
    parts.bars.push({
      label: "Result Type",
      icon: "fa-circle-info",
      wrappers: [this.type],
    });
    if (this.documentUuid) {
      const index = fromUuidSync(this.documentUuid);
      parts.associations = [
        {
          title: "Documents",
          icon: "file",
          cards: [
            {
              draggable: true,
              img: index.img,
              id: index._id,
              makeTooltip: true,
              name: index.nameString || index.name,
              type: index.type || "base",
              uuid: index.uuid,
            },
          ],
        },
      ];
    }
    return parts;
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        name: "Open Referenced Document",
        icon: makeIcon("file", "contextMenu"),
        condition: () => this.documentUuid,
        callback: async () =>
          await (await fromUuid(this.documentUuid))?.sheet.render(true),
      },
      ...super.getCardContextMenuEntries(doc),
    ];
  }
}
