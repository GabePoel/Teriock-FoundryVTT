import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockJournalEntryCategory } from "../_module.mjs";

declare module "./journal-entry.mjs" {
  export default interface TeriockJournalEntry {
    _id: Readonly<ID<TeriockJournalEntry>>;
    categories: EmbeddedCollection<TeriockJournalEntryCategory>;
    pages: EmbeddedCollection<TeriockJournalEntryPage>;

    get documentName(): "JournalEntry";
    get id(): ID<TeriockJournalEntry>;
    get uuid(): UUID<TeriockJournalEntry>;
  }
}

export {};
