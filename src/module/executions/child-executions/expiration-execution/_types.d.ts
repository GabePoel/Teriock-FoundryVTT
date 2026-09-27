import { BaseExpiration } from "../../../data/pseudo-documents/expirations/abstract/_module.mjs";

declare module "./expiration-execution.mjs" {
  export default interface ExpirationExecution {
    thresholdFormula: Teriock.System.FormulaString;

    _expiration: BaseExpiration;
  }
}

export {};
