declare module "./document-execution.mjs" {
  export default interface DocumentExecution {
    consumeUses: boolean;
    options: Teriock.Execution.ExecutionOptions;
  }
}

export {};
