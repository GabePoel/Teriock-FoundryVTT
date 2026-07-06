import { TeriockJournalEntryPage } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type CommonSystemData = {
      /** <base> Boosts formulas by roll type */
      boosts: Record<Teriock.Keys.Impact, Teriock.System.FormulaString>;
      /** <schema> Journal entry page only accessible to GM */
      gmNotes: UUID<TeriockJournalEntryPage>;

      get parent(): AnyCommonDocument;
    };
  }
}
