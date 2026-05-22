import { TeriockJournalEntryPage } from "../../../../documents/_module.mjs";

export type ChildDeltaMap = Record<CommonDocumentName, { dst: AnyCommonDocument[], src: AnyCommonDocument[] }>;

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
