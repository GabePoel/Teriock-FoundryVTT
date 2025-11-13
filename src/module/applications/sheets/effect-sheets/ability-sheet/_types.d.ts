import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { TeriockAbility } from "../../../../documents/_documents.mjs";

declare module "./ability-sheet.mjs" {
  export default interface TeriockAbilitySheet extends TeriockBaseEffectSheet {
    get document(): TeriockAbility;
  }
}
