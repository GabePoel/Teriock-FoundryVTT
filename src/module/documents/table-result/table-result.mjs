import { icons } from "../../constants/display/icons.mjs";
import { makeIcon, mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";

const { TableResult } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * The Teriock TableResult implementation.
 * @extends {TableResult}
 * @extends {ClientDocument}
 * @mixes EmbedCardDocument
 * @mixes BaseDocument
 * @mixes PanelDocument
 * @implements {Teriock.Documents.TableResultInterface}
 */
export default class TeriockTableResult extends mix(
  TableResult,
  mixins.BaseDocumentMixin,
  mixins.PanelDocumentMixin,
  mixins.EmbedCardDocumentMixin,
) {
  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, {
      makeTooltip: true,
      subtitle: this.type,
      text: this.parent.name || "",
    });
  }

  /** @inheritDoc */
  get panelParts() {
    /** @type {Teriock.MessageData.MessagePanel} */
    const parts = super.panelParts;
    parts.icon = icons.document.tableResult;
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
          cards: [
            {
              draggable: true,
              id: index._id,
              img: index.img,
              makeTooltip: true,
              name: index.fullName || index.name,
              type: index.type || "base",
              uuid: index.uuid,
            },
          ],
          icon: TERIOCK.display.icons.ui.document,
          title: game.i18n.localize(
            "TERIOCK.SYSTEMS.TableResult.PANELS.documents",
          ),
        },
      ];
    }
    return parts;
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        callback: async () =>
          await (await fromUuid(this.documentUuid))?.sheet.render(true),
        condition: () => this.documentUuid,
        icon: makeIcon(TERIOCK.display.icons.ui.document, "contextMenu"),
        name: game.i18n.localize("TERIOCK.SYSTEMS.TableResult.MENU.open"),
      },
      ...super.getCardContextMenuEntries(doc),
    ];
  }
}
