import { TeriockJournalEntryPage } from "../../../../documents/_module.mjs";

export type ChildDeltaMap = Record<
  TeriockCommonName,
  {
    src: TeriockCommon[];
    dst: TeriockCommon[];
  }
>;

declare global {
  namespace Teriock.Models {
    export interface CommonSystemInterface {
      /** <schema> Journal entry page only accessible to GM */
      gmNotes: UUID<TeriockJournalEntryPage>;
    }
  }
}
