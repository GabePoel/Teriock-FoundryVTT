import { TeriockJournalEntry } from "../_module.mjs";

declare module "./journal-entry-category.mjs" {
  export default interface TeriockJournalEntryCategory
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: Teriock.ID<TeriockJournalEntryCategory>;

    get documentName(): "JournalEntryCategory";

    get id(): Teriock.ID<TeriockJournalEntryCategory>;

    get parent(): TeriockJournalEntry;

    get uuid(): Teriock.UUID<TeriockJournalEntryCategory>;
  }
}

export {};
