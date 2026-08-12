declare module "./journal-entry-category.mjs" {
  export default interface TeriockJournalEntryCategory {
    _id: ID<TeriockJournalEntryCategory>;

    get documentName(): "JournalEntryCategory";

    get id(): ID<TeriockJournalEntryCategory>;

    get uuid(): UUID<TeriockJournalEntryCategory>;
  }
}

export {};
