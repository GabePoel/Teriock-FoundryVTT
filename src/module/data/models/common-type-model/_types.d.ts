import { TeriockJournalEntryPage } from "../../../documents/_module.mjs";

export type ChildDeltaMap = Record<
  TeriockCommonName,
  {
    src: TeriockCommon[];
    dst: TeriockCommon[];
  }
>;

declare module "./common-type-model.mjs" {
  export default interface CommonTypeModel {
    /** <schema> Journal entry page only accessible to GM */
    gmNotes: UUID<TeriockJournalEntryPage>;
  }
}
