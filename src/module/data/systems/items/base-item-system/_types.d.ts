import { TeriockActiveEffect } from "../../../../documents/_module.mjs";

declare module "./base-item-system.mjs" {
  export default interface BaseItemSystem {
    /** <schema> Whether this is disabled */
    disabled: boolean;
    /** <schema> Text description of flaws */
    flaws: string;
    /** <schema> ID of the effect this depends on */
    _dep: ID<TeriockActiveEffect> | null;
  }
}

export {};
