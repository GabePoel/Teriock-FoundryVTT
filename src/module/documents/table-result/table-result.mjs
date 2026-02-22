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
    parts.label = game.i18n.localize(
      "TERIOCK.SYSTEMS.TableResult.PANELS.tableResult",
    );
    parts.image = this.icon;
    parts.blocks.push({
      title: game.i18n.localize(
        "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
      ),
      text: this.description,
    });
    parts.bars.push({
      label: game.i18n.localize(
        "TERIOCK.SYSTEMS.TableResult.PANELS.resultType",
      ),
      icon: TERIOCK.display.icons.ui.info,
      wrappers: [this.type],
    });
    if (this.documentUuid) {
      const index = fromUuidSync(this.documentUuid);
      parts.associations = [
        {
          title: game.i18n.localize(
            "TERIOCK.SYSTEMS.TableResult.PANELS.documents",
          ),
          icon: TERIOCK.display.icons.ui.document,
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
        name: game.i18n.localize("TERIOCK.SYSTEMS.TableResult.MENU.open"),
        icon: makeIcon(TERIOCK.display.icons.ui.document, "contextMenu"),
        condition: () => this.documentUuid,
        callback: async () =>
          await (await fromUuid(this.documentUuid))?.sheet.render(true),
      },
      ...super.getCardContextMenuEntries(doc),
    ];
  }
}
