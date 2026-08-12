import { JournalEntryPage } from "@client/documents/_module.mjs";

import { TeriockJournalEntryPage as PageClass } from "../_module.mjs";

type JournalEntryPageDocument = Teriock.Documents.DocumentBase<PageClass, JournalEntryPage>;

interface PageSubtype<T extends JournalEntryPageType>
  extends
    Teriock.Documents.Subtype<JournalEntryPageDocument, T, JournalEntryPageSheetMap[T], JournalEntryPageSystemMap[T]>
{}

declare module "./journal-entry-page.mjs" {
  export default interface TeriockJournalEntryPage {
    _id: Readonly<ID<TeriockJournalEntryPage>>;

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
