import { BaseEffectSystem } from "../../../systems/effects/_module.mjs";

declare global {
  namespace Teriock.Expirations {
    export type BaseExpirationData = {
      method: "automatic" | "roll";
      result: "delete" | "disable";
      roll: {
        comparison: Teriock.Keys.Comparison;
        formula: Teriock.System.FormulaString;
        threshold: Teriock.System.FormulaString;
      };

      get parent(): BaseEffectSystem;
    };
  }
}
