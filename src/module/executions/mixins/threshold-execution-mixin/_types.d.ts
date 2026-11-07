declare global {
  namespace Teriock.Execution {
    export interface ThresholdExecutionData extends Omit<Teriock.Modifier.ModifierComponents, "score"> {
      comparison: Teriock.Keys.Comparison;
      participants: number;

      mobMembers: TeriockCombatant[];
      threshold: number | undefined;
    }
  }
}

export {};
