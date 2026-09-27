import { TeriockJournalEntryPage as PageClass } from "../_module.mjs";
import { TeriockDocumentSheet } from "../../applications/api/_module.mjs";
import { BasePageSystem } from "../../data/systems/pages/_module.mjs";

declare module "./journal-entry-page.mjs" {
  export default interface TeriockJournalEntryPage {
    _id: Readonly<ID<TeriockJournalEntryPage>>;
    sheet: TeriockDocumentSheet;
    system: BasePageSystem;
    type: JournalEntryPageType;

    get documentName(): "JournalEntryPage";
    get id(): ID<TeriockJournalEntryPage>;
    get uuid(): UUID<TeriockJournalEntryPage>;
  }
}

declare global {
  export type TeriockJournalEntryPage<T extends JournalEntryPageType = JournalEntryPageType> =
    & PageClass
    & Subtype<JournalEntryPageSystemMap, T>;
}

export {};
