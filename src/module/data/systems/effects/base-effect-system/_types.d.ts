import { TeriockActiveEffect } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type BaseEffectSystemData = {
      /** <schema> If this should apply even if parent is deattuned */
      applyIfDeattuned: boolean;
      /** <schema> If this effect should be deleted instead of disabled when it expires */
      deleteOnExpire: boolean;

      get parent(): TeriockActiveEffect;
    };
  }
}
