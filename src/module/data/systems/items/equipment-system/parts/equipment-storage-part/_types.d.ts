import { StorageModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type EquipmentStoragePartData = {
      /** <schema> Storage */
      storage: StorageModel;
      /** <schema> Weight (lb) */
      weight: number;
    };
  }
}

export {};
