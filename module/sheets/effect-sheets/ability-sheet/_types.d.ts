import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import { TeriockAbility } from "../../../types/documents";

declare module "./ability-sheet.mjs" {
  export default interface TeriockAbilitySheet extends TeriockBaseEffectSheet {
    effect: TeriockAbility;
    document: TeriockAbility;
  }
}
