import { SheetMixin } from "../../mixins/_module.mjs";

type SheetMixinType = typeof SheetMixin;

declare module "./base-item-sheet.mjs" {
  export default interface TeriockBaseItemSheet extends SheetMixinType {}
}
