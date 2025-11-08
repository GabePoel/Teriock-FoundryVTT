import { BlankMixin } from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
 * @mixes ClientDocumentMixin
 */
export default class TeriockJournalEntryPage extends BlankMixin(
  JournalEntryPage,
) {}
