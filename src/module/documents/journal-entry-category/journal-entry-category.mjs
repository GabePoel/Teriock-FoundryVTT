import { BlankMixin } from "../mixins/_module.mjs";

const { JournalEntryCategory } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntryCategory} implementation.
 * @extends {JournalEntryCategory}
 * @mixes ClientDocumentMixin
 */
export default class TeriockJournalEntryCategory extends BlankMixin(
  JournalEntryCategory,
) {}
