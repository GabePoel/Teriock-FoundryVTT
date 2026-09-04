import { ConstructionNode } from "../../_module.mjs";
import { PseudoCollection } from "../../collections/_module.mjs";

declare module "./construct-documents-automation.mjs" {
  export default interface ConstructDocumentsAutomation {
    constructionNodes: PseudoCollection<ConstructionNode>;
  }
}
export {};
