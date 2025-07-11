import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import { TeriockProperty } from "../../../types/documents";
import TeriockEffect from "../../../documents/effect.mjs";

declare module "./property-sheet.mjs" {
  export default interface TeriockPropertySheet extends TeriockBaseEffectSheet {
    effect: TeriockProperty & TeriockEffect;
    document: TeriockProperty & TeriockEffect;
  }
}
