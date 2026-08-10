import { JournalEntryPage } from "@client/documents/_module.mjs";

import { TeriockJournalEntry, TeriockJournalEntryPage } from "../_module.mjs";
import { default as TeriockPageSheet } from "../../applications/sheets/page-sheets/base-page-sheet.mjs";
import { HarmSystem } from "../../data/systems/pages/_module.mjs";

type JournalEntryPageDocument = Teriock.Documents.DocumentBase<TeriockJournalEntryPage, JournalEntryPage>;

declare global {
  export interface TeriockHarm
    extends Teriock.Documents.Subtype<JournalEntryPageDocument, "damage" | "drain", TeriockPageSheet, HarmSystem>
  {}

  export interface PageTypeMap {
    harm: TeriockHarm;
  }
}

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
