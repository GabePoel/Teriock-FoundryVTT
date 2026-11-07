declare global {
  namespace Teriock.Execution {
    export interface AmmunitionExecutionData {
      consumeAmmunition: boolean;

      ammunition: TeriockItem<"equipment"> | null | undefined;
    }
  }
}

export {};
