import { TeriockJournalEntry } from "../_module.mjs";

declare module "./journal-entry-page.mjs" {
  export default interface TeriockJournalEntryPage
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: Teriock.ID<TeriockJournalEntryPage>;

    get documentName(): "JournalEntryPage";

    get id(): Teriock.ID<TeriockJournalEntryPage>;

    get parent(): TeriockJournalEntry;

    get uuid(): Teriock.UUID<TeriockJournalEntryPage>;
  }
}

export {};
