import type {
  EvaluationModel,
  StorageModel,
} from "../../../../../models/_module.mjs";

export default interface EquipmentStoragePartInterface {
  /** <schema> Storage */
  storage: StorageModel;
  /** <schema> Weight (lb) */
  weight: EvaluationModel & {
    /** <special> Weight times quantity */
    total: number;
  };
}
