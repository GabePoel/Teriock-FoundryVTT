declare global {
  namespace Teriock.Execution {
    export interface CommandsExecutionData {
      boosts: number;
      crit: boolean;
      deboosts: number;
      commands: Set<Teriock.Keys.Command>;
    }
  }
}

export {};
