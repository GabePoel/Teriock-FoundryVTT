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

    /** Definition for an association card. */
    export type MessageAssociationCard = {
      name: string;
      uuid?: Teriock.UUID<TeriockCommon>;
      tooltip?: string;
      img: string;
      color?: string;
      icon?: string;
      id?: Teriock.ID<TeriockCommon>;
      type:
        | Teriock.Documents.ActorType
        | Teriock.Documents.ItemType
        | Teriock.Documents.EffectType;
    };

    /** Pieces of a group of associations within a chat message. */
    export type MessageAssociations = {
      /** The title of the message association. */
      title: string;
      /** Icon for this association. */
      icon?: string;
      /** Documents this message is associated with. */
      cards: Teriock.MessageData.MessageAssociationCard[];
    };

    /** Represents the individual rules-parts that make up a message. */
    export type MessageParts = {
      /** The URL or path to the image associated with the message. */
      image?: string;
      /** The name or title to display in the message. */
      name?: string;
      bars?: Teriock.MessageData.MessageBar[];
      blocks?: Teriock.MessageData.MessageBlock[];
      /** Font used for a message. Message uses font if nothing is specified. */
      font?: Teriock.Parameters.Shared.Font;
      associations?: Teriock.MessageData.MessageAssociations[];
      /** Font Awesome icons */
      icon?: string;
      /** Label that gets displayed upon hovering over icon. */
      label?: string;
    };

    /** Options for automatically configuring a message. */
    export type MessageOptions = {
      /** If true, the content of the message is obfuscated. */
      secret?: boolean;
    };
  }
}

export {};
