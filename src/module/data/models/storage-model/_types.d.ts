declare module "./storage-model.mjs" {
  export default interface StorageModel {
    /** <schema> Container enabled */
    enabled: boolean;
    /** <schema> Maximum number of items that can go in container (`null` = unlimited) */
    maxCount: number | null;
    /** <schema> Maximum weight that can go in container (`null` = unlimited) */
    maxWeight: number | null;
    /** <schema> Amount to multiply weight of each item in container by */
    weightMultiplier: number;
  }
}

export {};
