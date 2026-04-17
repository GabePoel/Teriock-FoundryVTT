import { EquipmentSystem } from "../../systems/items/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type StorageModelData = {
      /** <schema> Container enabled */
      enabled: boolean;
      /** <schema> Maximum number of items that can go in container (`null` = unlimited) */
      maxCount: number | null;
      /** <schema> Maximum weight that can go in container (`null` = unlimited) */
      maxWeight: number | null;
      /** <schema> Amount to multiply weight of each item in container by */
      weightMultiplier: number;

      get parent(): EquipmentSystem;
    };
  }
}

export {};
