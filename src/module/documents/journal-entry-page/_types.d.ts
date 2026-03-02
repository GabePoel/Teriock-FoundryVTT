import { TeriockJournalEntry, TeriockJournalEntryPage } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface JournalEntryPageInterface {
      _id: ID<TeriockJournalEntryPage>;
      parent: TeriockJournalEntry;

      get documentName(): "JournalEntryPage";

      get id(): ID<TeriockJournalEntryPage>;

      get uuid(): UUID<TeriockJournalEntryPage>;
    }
  }
}

export {};
