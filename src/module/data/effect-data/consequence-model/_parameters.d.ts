import { consequenceOptions } from "../../../constants/options/consequence-options.mjs";

declare global {
  namespace Teriock.Parameters.Consequence {
    /** Valid roll consequence keys */
    export type RollConsequenceKey = keyof typeof consequenceOptions.rolls;
    /** Valid common consequence keys */
    export type CommonImpactKey = keyof typeof consequenceOptions.common;
  }
}

export {};
