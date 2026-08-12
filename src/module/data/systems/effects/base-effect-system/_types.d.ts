declare module "./base-effect-system.mjs" {
  export default interface BaseEffectSystem extends Teriock.Models.BaseEffectSystemData {}
}

declare global {
  namespace Teriock.Models {
    export type BaseEffectSystemData = {
      /** <schema> If this should apply even if parent is deattuned */
      applyIfDeattuned: boolean;
    };
  }
}

export {};
