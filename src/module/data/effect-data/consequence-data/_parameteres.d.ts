declare global {
  namespace Teriock.Parameters.Consequence {
    /** Valid roll consequence keys */
    export type RollConsequenceKey =
      keyof typeof TERIOCK.options.consequence.rolls;
    /** Valid common consequence keys */
    export type CommonImpactKey =
      keyof typeof TERIOCK.options.consequence.common;
  }
}

export {};
