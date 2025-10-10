const { JournalEntry } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
 * @extends {JournalEntry}
 * @mixes ClientDocumentMixin
 * @property {"JournalEntry"} documentName
 * @property {boolean} isOwner
 * @property {EmbeddedCollection<Teriock.ID<TeriockJournalEntryCategory>, TeriockJournalEntryCategory>} categories
 * @property {EmbeddedCollection<Teriock.ID<TeriockJournalEntryPage>, TeriockJournalEntryPage>} pages
 */
export default class TeriockJournalEntry extends JournalEntry {}
