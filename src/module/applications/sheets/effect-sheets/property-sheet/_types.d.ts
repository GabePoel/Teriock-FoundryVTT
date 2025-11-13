import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { TeriockProperty } from "../../../../documents/_documents.mjs";

declare module "./property-sheet.mjs" {
  export default interface TeriockPropertySheet extends TeriockBaseEffectSheet {
    get document(): TeriockProperty;
  }
}
