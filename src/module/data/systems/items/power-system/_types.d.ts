import "./_parameters";

declare global {
  namespace Teriock.Models {
    export interface PowerSystemInterface
      extends Teriock.Models.BaseItemSystemInterface {
      /** <schema> Flaws */
      flaws: string;
      /** <schema> Max Armor Value */
      maxAv: 0 | 1 | 2 | 3 | 4;
      /** <schema> Power type */
      type: Teriock.Parameters.Power.PowerType;

      get parent(): TeriockPower;
    }
  }
}
