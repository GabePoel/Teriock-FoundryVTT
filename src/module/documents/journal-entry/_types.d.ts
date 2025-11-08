import {
  TeriockJournalEntryCategory,
  TeriockJournalEntryPage,
} from "../_module.mjs";

declare module "./journal-entry.mjs" {
  export default interface TeriockJournalEntry
    extends Teriock.Documents.Interface<
      TeriockJournalEntryCategory | TeriockJournalEntryPage
    > {
    _id: Teriock.ID<TeriockJournalEntry>;

    get documentName(): "JournalEntry";

    get id(): Teriock.ID<TeriockJournalEntry>;

    get uuid(): Teriock.UUID<TeriockJournalEntry>;
  }
}

export {};
