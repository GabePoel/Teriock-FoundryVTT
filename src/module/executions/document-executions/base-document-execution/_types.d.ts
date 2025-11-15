declare global {
  namespace Teriock.Execution {
    export type DocumentExecutionOptions =
      Teriock.Execution.BaseExecutionOptions & {
        source: TeriockChild;
      };
  }
}

export {};
