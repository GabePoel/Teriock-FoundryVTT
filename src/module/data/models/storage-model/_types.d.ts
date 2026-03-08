import { EvaluationModel } from "../_module.mjs";
import { EquipmentSystem } from "../../systems/items/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type StorageModelInterface = {
      /** <schema> Container enabled */
      enabled: boolean;
      /** <schema> Maximum number of items that can go in container */
      maxCount: EvaluationModel;
      /** <schema> Maximum weight that can go in container */
      maxWeight: EvaluationModel;
      /** <schema> Amount to multiply weight of each item in container by */
      weightMultiplier: string;

      get parent(): EquipmentSystem;
    };
  }
}

export {};
