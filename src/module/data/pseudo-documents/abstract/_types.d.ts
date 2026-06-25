import { BaseEffectSystem } from "../../systems/effects/_module.mjs";
import { BaseItemSystem } from "../../systems/items/_module.mjs";

declare global {
  namespace Teriock.PseudoDocuments {
    export type MechanicPseudoDocumentData = {
      activeQualifier: Teriock.System.FormulaString;
      competencies: Set<number>;
      heighten: Set<number>;

      get parent(): BaseEffectSystem | BaseItemSystem;
    };
  }
}
