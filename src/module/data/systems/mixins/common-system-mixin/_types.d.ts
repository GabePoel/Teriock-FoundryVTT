import { TeriockJournalEntryPage } from "../../../../documents/_module.mjs";
import { AutomationCollection } from "../../../../documents/collections/_module.mjs";

export type ChildDeltaMap = Record<
  CommonDocumentName,
  {
    src: CommonDocument[];
    dst: CommonDocument[];
  }
>;

declare global {
  namespace Teriock.Models {
    export type CommonSystemData = {
      /** <schema> Automations */
      automations: AutomationCollection;
      /** <base> Boosts formulas by roll type */
      boosts: Record<Teriock.Keys.Impact, Teriock.System.FormulaString>;
      /** <schema> Journal entry page only accessible to GM */
      gmNotes: UUID<TeriockJournalEntryPage>;

      get parent(): AnyCommonDocument;
    };
  }
}
