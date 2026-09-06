declare module "./base-effect-system.mjs" {
  export default interface BaseEffectSystem {
    /** <schema> If this should apply even if parent is deattuned */
    applyIfDeattuned: boolean;
  }
}

export {};
