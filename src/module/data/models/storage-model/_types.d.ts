import { EvaluationModel } from "../_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface StorageModelInterface {
      /** <schema> Container enabled */
      enabled: boolean;
      /** <schema> Maximum number of items that can go in container */
      maxCount: EvaluationModel;
      /** <schema> Maximum weight that can go in container */
      maxWeight: EvaluationModel;
      /** <schema> Amount to multiply weight of each item in container by */
      weightMultiplier: string;
    }
  }
}

export {};
