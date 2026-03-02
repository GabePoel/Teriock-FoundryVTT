import {
  TeriockJournalEntry,
  TeriockJournalEntryCategory,
} from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface JournalEntryCategoryInterface {
      _id: ID<TeriockJournalEntryCategory>;
      parent: TeriockJournalEntry;

      get documentName(): "JournalEntryCategory";

      get id(): ID<TeriockJournalEntryCategory>;

      get uuid(): UUID<TeriockJournalEntryCategory>;
    }
  }
}

export {};
