import type { TeriockProperty } from "../../../../documents/_module.mjs";
import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs"

declare module "./property-sheet.mjs" {
  export default interface TeriockPropertySheet extends TeriockBaseEffectSheet {
    get document(): TeriockProperty;
  }
}
