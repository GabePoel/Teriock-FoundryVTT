import { CommonSheetMixin } from "../../mixins/_module.mjs";

type SheetMixinType = typeof CommonSheetMixin;

declare module "./base-effect-sheet.mjs" {
  export default interface TeriockBaseEffectSheet extends SheetMixinType {}
}
