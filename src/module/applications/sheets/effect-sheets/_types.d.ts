import { TeriockDocumentSheet } from "../../api/_module.mjs";
import {
  AbilitySheet,
  ApplicableEffectSheet,
  AttunementSheet,
  ConditionSheet,
  ConsequenceSheet,
  FluencySheet,
  HackSheet,
  PropertySheet,
  ResourceSheet,
} from "./_module.mjs";

declare global {
  export interface ActiveEffectSheetMap {
    ability: AbilitySheet;
    attunement: AttunementSheet;
    condition: ConditionSheet;
    consequence: ConsequenceSheet;
    cover: TeriockDocumentSheet;
    fluency: FluencySheet;
    hack: HackSheet;
    imbuement: ApplicableEffectSheet;
    property: PropertySheet;
    resource: ResourceSheet;
  }
}
