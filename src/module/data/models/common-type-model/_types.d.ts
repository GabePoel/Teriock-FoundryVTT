import { TeriockJournalEntryPage } from "../../../documents/_module.mjs";

export interface CommonTypeData {
  /** <schema> Journal entry page only accessible to GM */
  gmNotes: UUID<TeriockJournalEntryPage>;
}

declare module "./common-type-model.mjs" {
  export default // @ts-expect-error Not a duplicate identifier
  class CommonTypeModel extends CommonTypeData {
    get parent(): TeriockCommon;
  }
}

export {};
