import {
  BaseDocumentMixin,
  EmbedCardDocumentMixin,
} from "../mixins/_module.mjs";

const { JournalEntry } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
 * @extends {JournalEntry}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 * @property {Collection<ID<TeriockJournalEntryCategory>, TeriockJournalEntryCategory>} categories
 * @property {Collection<ID<TeriockJournalEntryPage>, TeriockJournalEntryPage>} pages
 */
export default class TeriockJournalEntry extends EmbedCardDocumentMixin(
  BaseDocumentMixin(JournalEntry),
) {
  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.img = "icons/svg/book.svg";
    return parts;
  }
}
