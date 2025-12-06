import { EvaluationModel } from "../_module.mjs";

declare module "./storage-model.mjs" {
  export default interface StorageModel {
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
