declare global {
  namespace Teriock.Execution {
    export type FeatExecutionOptions = ThresholdExecutionOptions & {
      attribute: Teriock.Keys.Attribute;
    };
  }
}

export {};
