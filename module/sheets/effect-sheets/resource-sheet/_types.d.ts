import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import { TeriockResource } from "../../../types/documents";

declare module "./resource-sheet.mjs" {
  export default interface TeriockResourceSheet extends TeriockBaseEffectSheet {
    effect: TeriockResource;
    document: TeriockResource;
  }
}
