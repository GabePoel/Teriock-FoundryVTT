declare global {
  namespace Teriock.Execution {
    export type ResistanceExecutionOptions = ImmunityExecutionOptions &
      ThresholdExecutionOptions;
  }
}

export {};
