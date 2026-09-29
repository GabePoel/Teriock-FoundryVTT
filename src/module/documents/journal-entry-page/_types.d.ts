import { TeriockJournalEntry, TeriockJournalEntryPage as PageClass } from "../_module.mjs";
import { BasePageSystem } from "../../data/systems/pages/_module.mjs";

declare module "./journal-entry-page.mjs" {
  export default interface TeriockJournalEntryPage {
    _id: Readonly<ID<TeriockJournalEntryPage>>;
    system: BasePageSystem;
    type: JournalEntryPageType;

    readonly parent: TeriockJournalEntry;
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
