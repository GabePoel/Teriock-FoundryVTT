declare global {
  namespace Teriock.Models {
    export type EquipmentSuppressionPartInterface = {
      /** <schema> Is the equipment dampened? */
      dampened: boolean;
      /** <schema> Is the equipment destroyed? */
      destroyed: boolean;
      /** <schema> Is the equipment shattered? */
      shattered: boolean;
      /** <schema> Is the equipment stashed? If it is, it has no weight. */
      stashed: boolean;
    };
  }
}

export {};
