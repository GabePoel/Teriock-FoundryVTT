declare global {
  namespace Teriock.Messages {
    export type Mode = "public" | "gm" | "blind" | "self" | "ic";

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
      /** Additional CSS classes to add */
      classes?: string;
      /** Elder Sorcery elements for formatting. */
      elements?: string;
      /** Make this block italic. */
      italic?: boolean;
      /** Special information for formatting. */
      special?: "ES" | "embedded-block";
      /** The main text content of the message block. */
      text?: string;
      /** The title of the message block. */
      title: string;
    };

    /** Definition for an association card. */
    export type MessageAssociationCard = {
      color?: string;
      draggable?: boolean;
      icon?: string;
      id?: ID<CommonDocument>;
      img: string;
      makeTooltip?: boolean;
      name: string;
      pack?: string;
      rescale?: boolean;
      tooltip?: string;
      type: Teriock.Documents.ChildType;
      uuid?: UUID<CommonDocument>;
    };

    /** Pieces of a group of associations within a chat message. */
    export type MessageAssociation = {
      /** The title of the message association. */
      title: string;
      /** Icon for this association. */
      icon?: string;
      /** Documents this message is associated with. */
      cards: Teriock.Messages.MessageAssociationCard[];
    };

    /** Represents the individual rules-parts that make up a message. */
    export type MessagePanel = {
      associations?: Teriock.Messages.MessageAssociation[];
      bars?: Teriock.Messages.MessageBar[];
      blocks?: Teriock.Messages.MessageBlock[];
      /** Additional CSS classes to add */
      classes?: string;
      /** Color to assign to the image border. */
      color?: Teriock.Keys.Color;
      /** Font Awesome icons */
      icon?: string;
      /** The URL or path to the image associated with the message. */
      image?: string;
      /** Label that gets displayed upon hovering over icon. */
      label?: string;
      /** The name or title to display in the message. */
      name?: string;
      /** UUID of a document that can be opened */
      uuid?: UUID<ChildDocument>;
    };
  }
}

export {};
