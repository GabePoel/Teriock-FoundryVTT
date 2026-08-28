import { Color } from "@common/utils/_module.mjs";

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
      classes?: string[];
      /** Whether only GMs should be able to see this. */
      gmOnly?: boolean;
      /** The main text content of the message block. */
      text?: string;
      /** The title of the message block. */
      title: string;
    };

    /** Definition for an association card. */
    export type PanelAssociationCard = {
      // badge?: string;
      color?: Color;
      documentUuid?: UUID<TeriockDocument>;
      icon?: Teriock.Embeds.EmbedIcon;
      img: string;
      makeTooltip?: boolean;
      name: string;
      tooltip?: string;
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
      /** Panel associations */
      associations?: Teriock.Panels.PanelAssociation[];
      /** Panel bars */
      bars?: Teriock.Panels.PanelBar[];
      /** Panel blocks */
      blocks?: Teriock.Panels.PanelBlock[];
      /** Additional CSS classes to add */
      classes?: string[];
      /** Color to assign to the image border */
      color?: Color;
      /** UUID of a document that can be opened */
      documentUuid?: UUID<TeriockDocument>;
      /** Material Symbol or Material Design icon */
      icon?: string;
      /** The URL or path to the image associated with the panel */
      img?: string;
      /** The name or title to display in the panel */
      name?: string;
      /** Tips, such as suppression reasons in tooltips */
      tips?: Teriock.UI.Tip[];
    };

    export type EnrichmentOptions = {
      collapseTables?: boolean;
      keepId?: boolean;
      noAssociations?: boolean;
      noBars?: boolean;
      noBlocks?: boolean;
      usePanelRelativeTo?: boolean;
    };
  }
}

export {};
