import TeriockChatMessage from "../../../documents/chat-message.mjs";

export default interface TeriockBaseChatMessageSchema {
  /** Parent chat message */
  parent: TeriockChatMessage;
  overlay: string;
  columns: number;
  buttons: Teriock.HTMLButtonConfig[];
  tags: string[];
  extraContent: string;
  source: Teriock.UUID<any>;
}

declare module "./base-message-data.mjs" {
  /** Redundant declaration is needed for intellisense. */
  export default interface TeriockBaseMessageData extends TeriockBaseChatMessageSchema {}
}
