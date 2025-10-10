const { JournalEntryCategory } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntryCategory} implementation.
 * @extends {JournalEntryCategory}
 * @mixes ClientDocumentMixin
 * @property {"JournalEntryCategory"} documentName
 * @property {boolean} isOwner
 */
export default class TeriockJournalEntryCategory extends JournalEntryCategory {}
