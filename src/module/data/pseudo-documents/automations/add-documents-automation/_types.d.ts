import type effectConfig from "../../../../constants/config/effect-config.mjs";

import { ConstructionNode } from "../../_module.mjs";
import { PseudoCollection } from "../../collections/_module.mjs";

declare module "./add-documents-automation.mjs" {
  export default interface AddDocumentsAutomation {
    all: boolean;
    attachToEffect: boolean;
    auto: boolean;
    constructionNodes: PseudoCollection<ConstructionNode>;
    multi: boolean;
    selectInExecution: boolean;
    target: keyof typeof effectConfig.applicationTargets;
  }
}
export {};
