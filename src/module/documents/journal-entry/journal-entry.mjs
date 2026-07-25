import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { JournalEntry } = foundry.documents;

/**
 * The Teriock JournalEntry implementation.
 * @extends {JournalEntry}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 * @implements {Teriock.Documents.JournalEntryInterface}
 */
export default class TeriockJournalEntry
  extends mixClasses(JournalEntry, documentMixins.BaseDocumentMixin, documentMixins.EmbedCardDocumentMixin)
{
  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { img: "icons/svg/book.svg" });
  }
}
