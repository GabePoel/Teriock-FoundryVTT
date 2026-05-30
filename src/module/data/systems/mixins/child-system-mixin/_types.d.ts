import { ChildSettingsModel, EvaluationModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ChildSystemData = {
      /** <schema> Description */
      description: string;
      /** <derived> Whether this is forcibly suppressed by something else */
      forceSuppressed: boolean;
      /** <schema> <base> Qualifier formulas which are resolved before changes are applied */
      qualifiers: { ephemeral: EvaluationModel, suppressed: EvaluationModel };
      /** <schema> Per-document behavior and display settings */
      settings: ChildSettingsModel;

      get parent(): AnyChildDocument;
    };
  }
}
