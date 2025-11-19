import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntryCategory } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntryCategory} implementation.
 * @extends {ClientDocument}
 * @extends {JournalEntryCategory}
 * @mixes BaseDocument
 */
export default class TeriockJournalEntryCategory extends BaseDocumentMixin(
  JournalEntryCategory,
) {}
