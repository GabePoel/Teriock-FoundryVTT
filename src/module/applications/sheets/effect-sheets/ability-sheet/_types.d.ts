import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./ability-sheet.mjs" {
  export default interface TeriockAbilitySheet extends BaseEffectSheet {
    get document(): TeriockAbility;
  }
}
