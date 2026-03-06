declare global {
  namespace Teriock.Models {
    export type AbilityEquipmentPartInterface = {
      /** <schema> Can only be used with the item that grants it. */
      grantOnly: boolean;
      /** <derived> Text describing this being granted. */
      grantOnlyText: string;
    };
  }
}

export {};
