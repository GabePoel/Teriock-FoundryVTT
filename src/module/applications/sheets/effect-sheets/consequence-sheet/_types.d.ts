import { TeriockConsequence } from "../../../../documents/_documents.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./consequence-sheet.mjs" {
  export default interface TeriockConsequenceSheet
    extends TeriockBaseEffectSheet {
    get document(): TeriockConsequence;
  }
}
