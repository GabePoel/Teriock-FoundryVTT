declare global {
  namespace Teriock.Execution {
    export type TradecraftExecutionOptions = ThresholdExecutionOptions & {
      tradecraft: Teriock.Parameters.Fluency.Tradecraft;
    };
  }
}

export {};
