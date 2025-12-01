import { TeriockJournalEntryPage } from "../../../documents/_module.mjs";

declare module "./common-type-model.mjs" {
  export default interface CommonTypeModel {
    /** <schema> Journal entry page only accessible to GM */
    gmNotes: UUID<TeriockJournalEntryPage>;
  }
}
