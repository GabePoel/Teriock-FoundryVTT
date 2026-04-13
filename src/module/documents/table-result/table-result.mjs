import { icons } from "../../constants/display/icons.mjs";
import { migrateUuid } from "../../data/shared/migrations/source-migrations.mjs";
import { mix } from "../../helpers/construction.mjs";
import { makeIcon } from "../../helpers/utils.mjs";
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
  static migrateData(data) {
    this.documentUuid = migrateUuid(this.documentUuid);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, {
      makeTooltip: true,
      subtitle: this.type,
      text: this.parent.name || "",
    });
  }

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        onClick: async () =>
          await (await fromUuid(this.documentUuid))?.sheet.render(true),
        visible: () => this.documentUuid,
        icon: makeIcon(TERIOCK.display.icons.ui.document, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.TableResult.MENU.open"),
      },
      ...super.getCardContextMenuEntries(doc),
    ];
  }

  /** @inheritDoc */
  async getPanelParts() {
    /** @type {Teriock.Messages.MessagePanel} */
    const parts = await super.getPanelParts();
    parts.icon = icons.document.tableResult;
    parts.label = _loc("TERIOCK.SYSTEMS.TableResult.PANELS.tableResult");
    parts.image = this.icon;
    parts.blocks.push({
      title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
      text: this.description,
    });
    parts.bars.push({
      label: _loc("TERIOCK.SYSTEMS.TableResult.PANELS.resultType"),
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
          title: _loc("TERIOCK.SYSTEMS.TableResult.PANELS.documents"),
        },
      ];
    }
    return parts;
  }
}
