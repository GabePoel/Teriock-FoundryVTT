import "./_parameters";

declare global {
  namespace Teriock.Models {
    export interface TeriockPowerModelInterface
      extends Teriock.Models.TeriockBaseItemModelInterface {
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
