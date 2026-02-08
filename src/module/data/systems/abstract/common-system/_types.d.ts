import { TeriockJournalEntryPage } from "../../../../documents/_module.mjs";
import { TypeCollection } from "../../../../documents/collections/_module.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/_module.mjs";

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
      /** <schema> Automations */
      automations: TypeCollection<ID<BaseAutomation>, BaseAutomation>;
      /** <schema> Journal entry page only accessible to GM */
      gmNotes: UUID<TeriockJournalEntryPage>;

      get parent(): GenericCommon;
    }
  }
}
