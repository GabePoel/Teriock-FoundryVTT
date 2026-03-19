declare global {
  namespace Teriock.Execution {
    export type FeatSaveExecutionOptions = ThresholdExecutionOptions & {
      attribute: Teriock.Keys.Attribute;
    };
  }
}

export {};
