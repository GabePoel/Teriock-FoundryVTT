declare global {
  namespace Teriock.Execution {
    export type DocumentExecutionOptions = Teriock.Execution.BaseExecutionOptions & {
      consumeUses?: boolean;
      source?: AnyChildDocument;
    };
  }
}

export {};
