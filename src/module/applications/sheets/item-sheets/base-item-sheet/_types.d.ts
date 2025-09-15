import { CommonSheetMixin } from "../../mixins/_module.mjs";

type SheetMixinType = typeof CommonSheetMixin;

declare module "./base-item-sheet.mjs" {
  export default interface TeriockBaseItemSheet extends SheetMixinType {}
}
