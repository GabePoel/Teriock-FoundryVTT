declare global {
  namespace Teriock.Execution {
    export type EquipmentExecutionOptions = ArmamentExecutionOptions & {
      secret?: boolean;
      twoHanded?: boolean;
    };

    export interface EquipmentExecutionInterface {
      get source(): TeriockEquipment;
    }
  }
}

export {};
