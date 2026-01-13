import type { powerOptions } from "../../../../constants/options/power-options.mjs";

declare global {
  namespace Teriock.Parameters.Power {
    /** Power type */
    export type PowerType = keyof typeof powerOptions;
  }
}
