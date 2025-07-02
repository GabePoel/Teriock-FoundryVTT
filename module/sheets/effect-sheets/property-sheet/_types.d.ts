import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import { TeriockProperty } from "../../../types/documents";

declare module "./property-sheet.mjs" {
  export default interface TeriockPropertySheet extends TeriockBaseEffectSheet {
    effect: TeriockProperty;
    document: TeriockProperty;
  }
}
