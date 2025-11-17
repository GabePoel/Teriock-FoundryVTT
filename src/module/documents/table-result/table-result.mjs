import { makeIcon } from "../../helpers/utils.mjs";
import { EmbedCardDocumentMixin } from "../mixins/_module.mjs";

const { TableResult } = foundry.documents;

/**
 * The Teriock {@link TableResult} implementation.
 * @extends {TableResult}
 * @extends {ClientDocument}
 * @mixes EmbedCardDocument
 */
export default class TeriockTableResult extends EmbedCardDocumentMixin(
  TableResult,
) {
  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [
      {
        name: "Open Referenced Document",
        icon: makeIcon("file", "contextMenu"),
        condition: () => this.documentUuid,
        callback: async () =>
          await (await fromUuid(this.documentUuid))?.sheet.render(true),
      },
      ...super.cardContextMenuEntries,
    ];
  }
}
