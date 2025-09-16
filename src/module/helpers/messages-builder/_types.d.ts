declare global {
  namespace Teriock.MessageData {
    /** Pieces of a bar within a chat message. */
    export type MessageBar = {
      /** Name of FontAwesome icon to display in the message bar. */
      icon: string;
      /** The label of the message bar. */
      label: string;
      /** Strings to wrap within the message bar. */
      wrappers: string[];
    };

    /** Pieces of a block within a chat message. */
    export type MessageBlock = {
      /** The title of the message block. */
      title: string;
      /** The main text content of the message block. */
      text?: string;
      /** Special information for formatting. */
      special?: "ES" | "embedded-block";
      /** Elder Sorcery elements for formatting. */
      elements?: string;
      /** Make this block italic. */
      italic?: boolean;
    };

    /** Represents the individual rules-parts that make up a message. */
    export type MessageParts = {
      /** The URL or path to the image associated with the message. */
      image?: string;
      /** The name or title to display in the message. */
      name?: string;
      bars?: Teriock.MessageData.MessageBar[];
      blocks?: Teriock.MessageData.MessageBlock[];
      /** Font used for a message, or `null` for default font. */
      font?: Teriock.Parameters.Shared.Font;
    };

    /** Options for automatically configuring a message. */
    export type MessageOptions = {
      /** If true, the content of the message is obfuscated. */
      secret?: boolean;
    };
  }
}

export {};
