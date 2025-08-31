const { JournalEntry } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
 * @extends {JournalEntry}
 * @mixes ClientDocumentMixin
 * @property {"JournalEntry"} documentName
 * @property {boolean} isOwner
 */
export default class TeriockJournalEntry extends JournalEntry {}
