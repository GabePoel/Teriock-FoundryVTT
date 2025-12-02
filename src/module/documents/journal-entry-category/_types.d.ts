import { TeriockJournalEntry } from "../_module.mjs";

declare module "./journal-entry-category.mjs" {
  export default interface TeriockJournalEntryCategory
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockJournalEntryCategory>;

    get documentName(): "JournalEntryCategory";

    get id(): ID<TeriockJournalEntryCategory>;

    get parent(): TeriockJournalEntry;

    get uuid(): UUID<TeriockJournalEntryCategory>;
  }
}

export {};
