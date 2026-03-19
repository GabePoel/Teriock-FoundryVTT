import { EvaluationModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ChildSystemData = {
      /** <schema> Description */
      description: string;
      /** <schema> <base> Qualifier formulas which are resolved before changes are applied */
      qualifiers: {
        ephemeral: EvaluationModel;
        suppressed: EvaluationModel;
      };

      get parent(): AnyChildDocument;
    };
  }
}
