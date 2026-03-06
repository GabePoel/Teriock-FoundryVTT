import { EvaluationModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ChildSystemInterface = {
      /** <schema> Description */
      description: string;
      /** <schema> Font */
      font: Teriock.Parameters.Shared.Font;
      /** <schema> <base> Qualifier formulas which are resolved before changes are applied */
      qualifiers: {
        ephemeral: EvaluationModel;
        suppressed: EvaluationModel;
      };

      get parent(): AnyChildDocument;
    };
  }
}
