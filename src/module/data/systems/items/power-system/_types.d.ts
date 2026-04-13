declare global {
  namespace Teriock.Models {
    export type PowerSystemData = {
      /** <schema> Flaws */
      flaws: string;
      /** <schema> Maximum Armor Value */
      maxAv: 0 | 1 | 2 | 3 | 4;
      /** <schema> Power type */
      type: Teriock.Keys.PowerType;

      get parent(): TeriockPower;
    };
  }
}

export {};
