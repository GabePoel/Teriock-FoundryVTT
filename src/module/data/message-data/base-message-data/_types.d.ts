import TeriockChatMessage from "../../../documents/chat-message.mjs";

export default interface TeriockBaseChatMessageSchema {
  buttons: Teriock.UI.HTMLButtonConfig[];
  columns: number;
  extraContent: string;
  overlay: string;
  /** Parent chat message */
  parent: TeriockChatMessage;
  source: Teriock.UUID<any>;
  tags: string[];
}

declare module "./base-message-data.mjs" {
  /** Redundant declaration is needed for intellisense. */
  export default interface TeriockBaseMessageModel extends TeriockBaseChatMessageSchema {}
}
