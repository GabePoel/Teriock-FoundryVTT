declare global {
  namespace Teriock.Models {
    export type EquipmentIdentificationPartData = {
      /** <schema> Identification info */
      identification: {
        /** <schema> Is the equipment identified? */
        identified: boolean;
        /** <schema> Secret name for when this is identified */
        name: string;
        /** <schema> Whether magic has been read on this */
        read: boolean;
      };
    };
  }
}

export {};
