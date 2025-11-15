declare global {
  namespace Teriock.Execution {
    export type FeatSaveExecutionOptions = ThresholdExecutionOptions & {
      attribute: Teriock.Parameters.Actor.Attribute;
    };
  }
}

export {};
