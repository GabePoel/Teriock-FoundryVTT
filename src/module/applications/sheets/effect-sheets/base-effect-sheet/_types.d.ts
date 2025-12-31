import { TeriockEffect } from "../../../../documents/_module.mjs";

declare module "./base-effect-sheet.mjs" {
  export default interface TeriockBaseEffectSheet {
    get document(): TeriockEffect;
  }
}
