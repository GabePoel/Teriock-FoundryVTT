import type { IdentificationModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type EquipmentIdentificationPartData = {
      /** <schema.> Identification info */
      identification: IdentificationModel;
    };
  }
}

export {};
