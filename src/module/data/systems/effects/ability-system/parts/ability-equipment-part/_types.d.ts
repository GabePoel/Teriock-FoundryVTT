declare global {
  namespace Teriock.Models {
    export type AbilityEquipmentPartData = {
      /** <schema> Consumes the item that grants it. */
      consumeSource: boolean;
      /** <derived> Text describing this consuming its source. */
      consumeSourceText: string;
      /** <schema> Can only be used with the item that grants it. */
      grantOnly: boolean;
      /** <derived> Text describing this being granted. */
      grantOnlyText: string;
      /** <schema> Can this only be used when its parent is used */
      grantUse: boolean;
      /** <derived> Text describing that this is used when its parent is used. */
      grantUseText: string;
    };
  }
}

export {};
