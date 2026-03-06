import { TeriockJournalEntryPage } from "../../../../documents/_module.mjs";
import { TypeCollection } from "../../../../documents/collections/_module.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/abstract/_module.mjs";

export type ChildDeltaMap = Record<
  CommonDocumentName,
  {
    src: CommonDocument[];
    dst: CommonDocument[];
  }
>;

declare global {
  namespace Teriock.Models {
    export type CommonSystemInterface = {
      /** <schema> Automations */
      automations: TypeCollection<ID<BaseAutomation>, BaseAutomation>;
      /** <base> Boosts formulas by roll type */
      boosts: Record<Teriock.Parameters.Consequence.RollConsequenceKey, string>;
      /** <schema> Journal entry page only accessible to GM */
      gmNotes: UUID<TeriockJournalEntryPage>;

      get parent(): AnyCommonDocument;
    };
  }
}
