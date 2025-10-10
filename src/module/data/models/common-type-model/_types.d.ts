import type { TeriockJournalEntryPage } from "../../../documents/_module.mjs";

declare module "./common-type-model.mjs" {
  export default // @ts-expect-error Not a duplicate identifier
  class CommonTypeModel {
    /** <schema> Journal entry page only accessible to GM */
    gmNotes: Teriock.UUID<TeriockJournalEntryPage>;

    get parent(): TeriockCommon;
  }
}

export {};
