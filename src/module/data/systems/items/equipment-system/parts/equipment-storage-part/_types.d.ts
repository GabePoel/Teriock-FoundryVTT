import type {
  EvaluationModel,
  StorageModel,
} from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type EquipmentStoragePartInterface = {
      /** <schema> Storage */
      storage: StorageModel;
      /** <schema> Weight (lb) */
      weight: EvaluationModel & {
        /** <special> Weight times quantity */
        total: number;
      };
    };
  }
}

export {};
