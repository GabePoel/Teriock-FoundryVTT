import { EvaluationModel } from "../_module.mjs";

declare module "./child-type-model" {
  export default interface ChildTypeModelInterface {
    /** <schema> Description */
    description: string;
    /** <schema> Font */
    font: Teriock.Parameters.Shared.Font;
    /** <schema> <base> Qualifier formulas which are resolved before changes are applied */
    qualifiers: {
      ephemeral: EvaluationModel;
      suppressed: EvaluationModel;
    };

    get parent(): TeriockChild;
  }
}

export {};
