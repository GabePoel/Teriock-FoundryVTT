import { BaseExpiration } from "../../../data/pseudo-documents/expirations/abstract/_module.mjs";

declare global {
  namespace Teriock.Execution {
    export type ExpirationExecutionOptions = Teriock.Execution.ThresholdExecutionOptions & {
      expiration?: BaseExpiration;
    };
  }
}
