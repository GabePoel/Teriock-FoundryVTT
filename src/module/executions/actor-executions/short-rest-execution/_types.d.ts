declare global {
  namespace Teriock.Execution {
    export type ShortRestExecutionOptions = DocumentExecutionOptions & { useAbilities?: boolean };
  }
}

export {};
