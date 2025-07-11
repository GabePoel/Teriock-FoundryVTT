import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { TeriockResource } from "../../../types/documents";
import TeriockEffect from "../../../documents/effect.mjs";

declare module "./resource-sheet.mjs" {
  export default interface TeriockResourceSheet extends TeriockBaseEffectSheet {
    effect: TeriockResource & TeriockEffect;
    document: TeriockResource & TeriockEffect;
  }
}
