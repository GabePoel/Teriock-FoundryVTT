import TeriockBaseEffectSheet from "../base-effect-sheet/base-effect-sheet.mjs";
import TeriockEffect from "../../../documents/effect.mjs";
import TeriockEffectData from "../../../data/effect-data/effect-data/effect-data.mjs";

declare module "./effect-sheet.mjs" {
  export default interface TeriockEffectSheet extends TeriockBaseEffectSheet {
    effect: TeriockEffect & {
      system: TeriockEffectData;
    };
    document: TeriockEffect & {
      system: TeriockEffectData;
    };
  }
}
