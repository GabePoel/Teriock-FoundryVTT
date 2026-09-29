import { TeriockJournalEntry } from "../_module.mjs";

declare module "./journal-entry-category.mjs" {
  export default interface TeriockJournalEntryCategory {
    _id: Readonly<ID<TeriockJournalEntryCategory>>;

    readonly parent: TeriockJournalEntry;
    get documentName(): "JournalEntryCategory";
    get id(): ID<TeriockJournalEntryCategory>;
    get uuid(): UUID<TeriockJournalEntryCategory>;
  }
}

export {};
