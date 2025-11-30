import {
  TeriockJournalEntryCategory,
  TeriockJournalEntryPage,
} from "../_module.mjs";

declare module "./journal-entry.mjs" {
  export default interface TeriockJournalEntry
    extends Teriock.Documents.Interface<
      TeriockJournalEntryCategory | TeriockJournalEntryPage
    > {
    _id: ID<TeriockJournalEntry>;

    get documentName(): "JournalEntry";

    get id(): ID<TeriockJournalEntry>;

    get uuid(): UUID<TeriockJournalEntry>;
  }
}

export {};
