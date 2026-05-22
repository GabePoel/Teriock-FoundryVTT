declare global {
  namespace Teriock.Execution {
    export type TradecraftExecutionOptions = ThresholdExecutionOptions & { tradecraft: Teriock.Keys.Tradecraft };
  }
}

export {};
