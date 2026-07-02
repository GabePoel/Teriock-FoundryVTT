import "./identification-model/_types";
import "./modifier-models/_types";
import "./preview-models/_types";
import "./settings-models/_types";
import "./stat-pool-models/_types";
import "./storage-model/_types";
import "./unit-models/_types";

declare global {
  namespace Teriock.Options {
    export type EvaluationOptions = Teriock.Fields.FormulaDerivationOptions & { rollData?: object };
  }
}
