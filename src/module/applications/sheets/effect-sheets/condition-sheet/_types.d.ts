import BaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";

declare module "./condition-sheet.mjs" {
  export default interface TeriockConditionSheet extends BaseEffectSheet {
    get document(): TeriockCondition;
  }
}
