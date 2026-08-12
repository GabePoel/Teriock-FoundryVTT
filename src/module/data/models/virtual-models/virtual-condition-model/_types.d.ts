declare module "./virtual-condition-model.mjs" {
  export default interface VirtualConditionModel {
    conditionKey: Teriock.Keys.Condition;
    locked: boolean;
    tooltip: string;
  }
}

export {};
