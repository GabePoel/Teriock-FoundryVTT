import type { consequenceOptions } from "../../../constants/options/consequence-options.mjs";

declare global {
  namespace Teriock.Parameters.Consequence {
    /** Valid roll consequence keys */
    export type RollConsequenceKey = keyof typeof consequenceOptions.rolls;
    /** Valid common consequence keys */
    export type CommonConsequenceKey = keyof typeof consequenceOptions.common;
  }
}
