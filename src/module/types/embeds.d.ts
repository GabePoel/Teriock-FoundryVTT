import type { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";

declare global {
  namespace Teriock.Embeds {
    export type EmbedIcon = {
      action?: string;
      classes?: string;
      clickable?: boolean;
      dataset?: object;
      icon?: Teriock.Embeds.EmbedIcon;
      tooltip?: string;
      visible?: (() => boolean) | boolean;
      onClick?: (event: PointerEvent, relative: TeriockDocument) => Promise<void>;
    };

    export type EmbedParts = {
      action?: string;
      color?: string;
      draggable?: boolean;
      hidden?: boolean;
      icons?: Teriock.Embeds.EmbedIcon[];
      id?: ID<AnyCommonDocument>;
      identifier?: string | TypedIdentifier;
      img: string;
      inactive?: boolean;
      makeTooltip?: boolean;
      openable?: boolean;
      parentId?: ID<AnyCommonDocument>;
      relative?: UUID<TeriockDocument>;
      shattered?: boolean;
      struck?: boolean;
      subtitle?: string;
      subtitleAction?: string;
      subtitleTooltip?: string;
      text?: string;
      title: string;
      tooltip?: string;
      tooltipUuid?: UUID<TeriockDocument>;
      usable?: boolean;
      uuid?: string | UUID<AnyCommonDocument>;
    };

    /**
     * @todo Make this more like `DEFAULT_OPTIONS`.
     */
    export type EmbedAction = {
      primary: (event: PointerEvent, relative: TeriockDocument) => Promise<void>;
      secondary?: (event: PointerEvent, relative: TeriockDocument) => Promise<void>;
    };

    /**
     * Shared interface for anything that can be displayed as an embedded card.
     */
    export interface Embeddable {
      /**
       * Actions that can fire from the embedded card.
       */
      get _embedActions(): Record<string, Partial<Teriock.Embeds.EmbedAction>>;

      /**
       * Interactive icons to display on the embedded card.
       */
      get _embedIcons(): Partial<Teriock.Embeds.EmbedIcon>[];

      /**
       * Parts passed into the block template to make the embedded card.
       */
      get embedParts(): Partial<Teriock.Embeds.EmbedParts>;

      /**
       * Context menu entries for right-clicking on the embedded card.
       */
      getEmbedContextMenuEntries(relative?: TeriockDocument): ContextMenuEntry[];

      /**
       * Connect listeners to the embedded card.
       */
      onEmbed(element: HTMLElement): void;

      /** A name used for searching and sorting. */
      name: string;

      /** A stable ID to distinguish this within previews. */
      uuid: UUID<Embeddable>;
    }
  }
}

export {};
