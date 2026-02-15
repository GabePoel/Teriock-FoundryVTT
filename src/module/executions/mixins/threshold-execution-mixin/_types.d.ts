declare global {
  namespace Teriock.Execution {
    export type ThresholdExecutionOptions =
      Teriock.Execution.BaseExecutionOptions &
        Teriock.Interaction.ThresholdOptions;
  }
}

export {};
