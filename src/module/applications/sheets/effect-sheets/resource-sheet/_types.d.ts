import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { TeriockResource } from "../../../../documents/_documents.mjs";

declare module "./resource-sheet.mjs" {
  export default interface TeriockResourceSheet extends TeriockBaseEffectSheet {
    get document(): TeriockResource;
  }
}
