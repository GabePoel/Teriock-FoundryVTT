declare global {
  namespace Teriock.Execution {
    export type ResistanceExecutionOptions = ThresholdExecutionOptions & {
      image?: string;
      wrappers?: string[];
    };
  }
}

export {};
