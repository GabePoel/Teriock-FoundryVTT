import { mixClasses } from "../../helpers/construction.mjs";
import * as mixins from "../mixins/_module.mjs";

const { JournalEntry } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock JournalEntry implementation.
 * @implements {Teriock.Documents.JournalEntryInterface}
 * @extends {JournalEntry}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 */
export default class TeriockJournalEntry extends mixClasses(
  JournalEntry,
  mixins.BaseDocumentMixin,
  mixins.EmbedCardDocumentMixin,
) {
  /** @inheritDoc */
  get embedParts() {
    return Object.assign(super.embedParts, { img: "icons/svg/book.svg" });
  }
}
