import { TeriockJournalEntry, TeriockJournalEntryCategory, TeriockJournalEntryPage } from "../_module.mjs";
import { DocumentCollection } from "../../../../foundry/client/documents/abstract/_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface JournalEntryInterface {
      _id: ID<TeriockJournalEntry>;
      // @ts-expect-error DocumentConstructionContext
      categories: DocumentCollection<TeriockJournalEntryCategory>;
      // @ts-expect-error DocumentConstructionContext
      pages: DocumentCollection<TeriockJournalEntryPage>;

      get documentName(): "JournalEntry";

      get id(): ID<TeriockJournalEntry>;

      get uuid(): UUID<TeriockJournalEntry>;
    }
  }
}

export {};
