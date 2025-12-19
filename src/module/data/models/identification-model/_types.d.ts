declare global {
  namespace Teriock.Models {
    export interface IdentificationModelInterface {
      /** <schema> Secret flaws for when this is identified */
      flaws: string;
      /** <schema> Is the equipment identified? */
      identified: boolean;
      /** <schema> Secret name for when this is identified */
      name: string;
      /** <schema> Secret notes for when this is identified */
      notes: string;
      /** <schema> Secret power level */
      powerLevel: Teriock.Parameters.Equipment.EquipmentPowerLevel;
      /** <schema> Whether magic has been read on this */
      read: boolean;
    }
  }
}

export {};
