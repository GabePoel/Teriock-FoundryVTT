declare module "./take-activation.mjs" {
  export default interface TakeActivation {
    command: Teriock.Keys.Command;
    amount: number;
  }
}

export {};
