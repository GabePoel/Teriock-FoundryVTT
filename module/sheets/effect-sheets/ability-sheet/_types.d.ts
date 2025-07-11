import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { TeriockAbility } from "../../../types/documents";
import TeriockEffect from "../../../documents/effect.mjs";

declare module "./ability-sheet.mjs" {
  export default interface TeriockAbilitySheet extends TeriockBaseEffectSheet {
    effect: TeriockAbility & TeriockEffect;
    document: TeriockAbility & TeriockEffect;
  }
}
