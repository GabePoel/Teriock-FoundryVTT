import { DocumentCollection } from "../../../../foundry/client/documents/abstract/_module.mjs";
import { TeriockJournalEntry, TeriockJournalEntryCategory, TeriockJournalEntryPage } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface JournalEntryInterface {
      _id: ID<TeriockJournalEntry>;
      categories: DocumentCollection<TeriockJournalEntryCategory>;
      pages: DocumentCollection<TeriockJournalEntryPage>;

      get documentName(): "JournalEntry";

      get id(): ID<TeriockJournalEntry>;

      get uuid(): UUID<TeriockJournalEntry>;
    }
  }
}

export {};
