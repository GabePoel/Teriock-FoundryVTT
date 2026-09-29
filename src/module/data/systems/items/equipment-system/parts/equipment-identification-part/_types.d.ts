import type { IdentificationModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface EquipmentIdentificationPartData {
      /** <schema.> Identification info */
      identification: IdentificationModel;
    }
  }
}

export {};
