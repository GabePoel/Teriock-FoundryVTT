declare global {
  namespace Teriock.Execution {
    export type ImpactsExecutionOptions = Teriock.Execution.BaseExecutionOptions & {
      boosts?: number;
      crit?: boolean;
      document?: AnyChildDocument;
      impact?: Teriock.Keys.Impact;
      impacts?: Iterable<Teriock.Keys.Impact>;
    };
  }
}

export {};
