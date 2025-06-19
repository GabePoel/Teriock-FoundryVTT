import type TeriockBaseEffectSheet from "../base-sheet/base-sheet.mjs";
import type TeriockEffect from "../../../documents/effect.mjs";
import type TeriockEffectData from "../../../data/effect-data/effect-data.mjs";

declare module "./effect-sheet.mjs" {
  export default interface TeriockEffectSheet extends TeriockBaseEffectSheet {
    effect: TeriockEffect & { system: TeriockEffectData };
    document: TeriockEffect & { system: TeriockEffectData };
  }
}
