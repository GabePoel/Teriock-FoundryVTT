import { TeriockJournalEntryPage as PageClass } from "../_module.mjs";
import { BasePageSystem } from "../../data/systems/pages/_module.mjs";

type PageSubtype<T extends JournalEntryPageType> = PageClass & {
  sheet: JournalEntryPageSheetMap[T];
  system: JournalEntryPageSystemMap[T];
  type: T;
};

declare module "./journal-entry-page.mjs" {
  export default interface TeriockJournalEntryPage {
    _id: Readonly<ID<TeriockJournalEntryPage>>;
    system: BasePageSystem;
    type: JournalEntryPageType;

    get documentName(): "JournalEntryPage";
    get id(): ID<TeriockJournalEntryPage>;
    get uuid(): UUID<TeriockJournalEntryPage>;
  }
}

declare global {
  export type TeriockJournalEntryPage<T extends JournalEntryPageType = JournalEntryPageType> = T extends unknown
    ? PageSubtype<T>
    : never;
}

export {};
