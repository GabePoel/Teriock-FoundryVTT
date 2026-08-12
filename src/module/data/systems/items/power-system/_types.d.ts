declare module "./power-system.mjs" {
  export default interface PowerSystem {
    /** <schema> Flaws */
    flaws: string;
    /** <schema> Maximum Armor Value */
    maxAv: 0 | 1 | 2 | 3 | 4;
  }
}

export {};
