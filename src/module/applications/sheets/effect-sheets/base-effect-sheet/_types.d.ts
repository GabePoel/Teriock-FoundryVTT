import { SheetMixin } from "../../mixins/_module.mjs";

type SheetMixinType = typeof SheetMixin;

declare module "./base-effect-sheet.mjs" {
  export default interface TeriockBaseEffectSheet extends SheetMixinType {}
}
