const { JournalEntryPage } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
 * @extends {JournalEntryPage}
 * @mixes ClientDocumentMixin
 * @property {"JournalEntryPage"} documentName
 * @property {boolean} isOwner
 */
export default class TeriockJournalEntryPage extends JournalEntryPage {}
