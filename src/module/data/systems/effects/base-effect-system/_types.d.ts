import { TeriockActiveEffect } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type BaseEffectSystemData = {
      /** <schema> If this should apply even if parent is deattuned */
      applyIfDeattuned: boolean;

      get parent(): TeriockActiveEffect;
    };
  }
}
