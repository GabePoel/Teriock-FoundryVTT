import { TeriockActiveEffect } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface BaseEffectSystemInterface
      extends Teriock.Models.ChildSystemInterface {
      /** <schema> If this effect should be deleted instead of disabled when it expires */
      deleteOnExpire: boolean;

      get parent(): TeriockActiveEffect;
    }
  }
}
