import type { IdentificationModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type EquipmentIdentificationPartInterface = {
      /** <schema.> Identification info */
      identification: IdentificationModel;
    };
  }
}

export {};
