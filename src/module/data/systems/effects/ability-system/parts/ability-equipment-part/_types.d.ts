declare global {
  namespace Teriock.Models {
    export type AbilityEquipmentPartInterface = {
      /** <schema> Consumes the item that grants it. */
      consumeSource: boolean;
      /** <derived> Text describing this consuming its source. */
      consumeSourceText: string;
      /** <schema> Can only be used with the item that grants it. */
      grantOnly: boolean;
      /** <derived> Text describing this being granted. */
      grantOnlyText: string;
    };
  }
}

export {};
