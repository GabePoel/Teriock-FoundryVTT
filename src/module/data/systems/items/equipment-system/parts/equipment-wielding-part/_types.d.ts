declare global {
  namespace Teriock.Models {
    export type EquipmentWieldingPartData = {
      /** <schema> Ammunition */
      ammunition: {
        /** <schema> The amount of ammunition this consumes */
        consumptionAmount: number;
        /** <base> Whether this uses ammunition */
        enabled: boolean;
        /** <schema> The type of ammunition this uses */
        type: TypedIdentifier<"equipment">;
      };
      /** <schema> Is the equipment equipped? */
      equipped: boolean;
      /** <base> Is the equipment glued? */
      glued: boolean;
      /** <schema> Minimum STR */
      minStr: number;
    };
  }
}

export {};
