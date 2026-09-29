import { StorageModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface EquipmentStoragePartData {
      /** <schema> Storage */
      storage: StorageModel;
      /** <schema> Weight (lb) */
      weight: number;
    }
  }
}

export {};
