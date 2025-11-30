import { TeriockJournalEntry } from "../_module.mjs";

declare module "./journal-entry-page.mjs" {
  export default interface TeriockJournalEntryPage
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockJournalEntryPage>;

    get documentName(): "JournalEntryPage";

    get id(): ID<TeriockJournalEntryPage>;

    get parent(): TeriockJournalEntry;

    get uuid(): UUID<TeriockJournalEntryPage>;
  }
}

export {};
