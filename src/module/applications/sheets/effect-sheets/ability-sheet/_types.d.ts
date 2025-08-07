import type { TeriockAbility } from "../../../../documents/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs"

declare module "./ability-sheet.mjs" {
  export default interface TeriockAbilitySheet extends TeriockBaseEffectSheet {
    get document(): TeriockAbility;
  }
}
