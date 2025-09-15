import TeriockChatMessage from "../../../documents/chat-message.mjs";

export default interface TeriockBaseChatMessageSchema {
  /** <schema> Buttons to display below the content of the message */
  buttons: Teriock.UI.HTMLButtonConfig[];
  /** <schema> Custom number of columns */
  columns: number;
  /** <schema> Content to be displayed in addition to {@link TeriockRoll} results */
  extraContent: string;
  /** <schema> Elder Sorcery spell circle overlay */
  overlay: string;
  /** <schema> Document that the message is sourced from */
  source: Teriock.UUID<TeriockCommon>;
  /** <schema> Strings to be wrapped as tags at the bottom of the message */
  tags: string[];

  get parent(): TeriockChatMessage;
}

declare module "./base-message-data.mjs" {
  /** Redundant declaration is needed for intellisense. */
  export default interface TeriockBaseMessageModel extends TeriockBaseChatMessageSchema {}
}
