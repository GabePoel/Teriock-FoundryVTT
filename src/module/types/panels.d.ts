declare global {
  namespace Teriock.Panels {
    /** Pieces of a bar within a panel. */
    export type PanelBar = {
      /** Name of FontAwesome icon to display in the message bar. */
      icon: string;
      /** The label of the message bar. */
      label: string;
      /** Strings to wrap within the message bar. */
      wrappers: string[];
    };

    /** Pieces of a block within a panel. */
    export type PanelBlock = {
      /** Additional CSS classes to add */
      classes?: string;
      /** The main text content of the message block. */
      text?: string;
      /** The title of the message block. */
      title: string;
    };

    /** Definition for an association card. */
    export type PanelAssociationCard = {
      badge?: string;
      color?: string;
      draggable?: boolean;
      icon?: Teriock.EmbedData.EmbedIcon;
      id?: ID<TeriockDocument>;
      img: string;
      makeTooltip?: boolean;
      name: string;
      pack?: string;
      tooltip?: string;
      type?: Teriock.Documents.ChildType;
      uuid?: UUID<TeriockDocument>;
    };

    /** Pieces of a group of associations within a panel. */
    export type PanelAssociation = {
      /** Documents this panel is associated with. */
      cards: Teriock.Panels.PanelAssociationCard[];
      /** Icon for this association. */
      icon?: string;
      /** The title of the panel association. */
      title: string;
    };

    /** Represents the individual rules-parts that make up a panel. */
    export type PanelParts = {
      associations?: Teriock.Panels.PanelAssociation[];
      bars?: Teriock.Panels.PanelBar[];
      blocks?: Teriock.Panels.PanelBlock[];
      /** Additional CSS classes to add */
      classes?: string;
      /** Color to assign to the image border. */
      color?: Teriock.Keys.Color;
      /** Font Awesome icons */
      icon?: string;
      /** The URL or path to the image associated with the panel. */
      image?: string;
      /** Label that gets displayed upon hovering over icon. */
      label?: string;
      /** The name or title to display in the panel. */
      name?: string;
      /** UUID of a document that can be opened */
      uuid?: UUID<TeriockDocument>;
    };
  }
}

export {};
