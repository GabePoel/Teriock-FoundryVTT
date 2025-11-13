import { TeriockCondition } from "../../../../documents/_documents.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./condition-sheet.mjs" {
  export default interface TeriockConditionSheet
    extends TeriockBaseEffectSheet {
    get document(): TeriockCondition;
  }
}
