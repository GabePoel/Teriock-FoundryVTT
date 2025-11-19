import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { JournalEntryPage } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
 * @extends {ClientDocument}
 * @mixes BaseDocument
 */
export default class TeriockJournalEntryPage extends BaseDocumentMixin(
  JournalEntryPage,
) {}
