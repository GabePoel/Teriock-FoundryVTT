import { BlankMixin } from "../mixins/_module.mjs";

const { JournalEntry } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link JournalEntry} implementation.
 * @extends {JournalEntry}
 * @extends {ClientDocument}
 * @property {EmbeddedCollection<Teriock.ID<TeriockJournalEntryCategory>, TeriockJournalEntryCategory>} categories
 * @property {EmbeddedCollection<Teriock.ID<TeriockJournalEntryPage>, TeriockJournalEntryPage>} pages
 */
export default class TeriockJournalEntry extends BlankMixin(JournalEntry) {}
