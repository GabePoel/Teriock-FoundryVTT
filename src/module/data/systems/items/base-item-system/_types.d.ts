declare module "./base-item-system.mjs" {
  export default interface BaseItemSystem {
    /** <schema> Whether this is disabled */
    disabled: boolean;
    /** <schema> Text description of flaws */
    flaws: string;
  }
}

export {};
