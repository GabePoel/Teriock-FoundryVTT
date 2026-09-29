declare module "./base-message-system.mjs" {
  export default interface BaseMessageSystem {
    readonly parent: TeriockChatMessage;
  }
}

export {};
