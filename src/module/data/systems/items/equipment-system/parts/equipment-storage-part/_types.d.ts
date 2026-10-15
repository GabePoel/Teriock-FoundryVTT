declare global {
  namespace Teriock.Models {
    export type EquipmentStoragePartData = {
      /** <schema> Storage */
      storage: {
        /** <schema> Count of items in container */
        count: {
          /** <schema> Maximum number of items that can go in container (`null` = unlimited) */
          max: number;
          /** Whether this is over its maximum count */
          readonly over: boolean;
          /** Number of items carried */
          readonly value: number;
        };
        /** <schema> Container enabled */
        enabled: boolean;
        /** <schema> Weight of items in container */
        weight: {
          /** <schema> Maximum weight that can go in container (`null` = unlimited) */
          max: number;
          /** <schema> Amount to multiply weight of each item in container by */
          multiplier: number;
          /** Whether this is over its maximum weight */
          readonly over: boolean;
          /** Weight of items carried */
          readonly value: number;
        };
      };
      /** <schema> Weight (lb) */
      weight: number;
    };
  }
}

export {};
