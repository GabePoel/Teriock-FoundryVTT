declare global {
  namespace Teriock.Execution {
    export type ImpactsExecutionOptions = Teriock.Execution.ExecutionOptions & { document?: AnyChildDocument };
  }
}

export {};
