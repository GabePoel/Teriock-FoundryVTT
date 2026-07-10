declare global {
  namespace Teriock.Execution {
    export type ImmunityExecutionOptions = ExecutionOptions & { hex?: boolean, img?: string, wrappers?: string[] };
  }
}

export {};
