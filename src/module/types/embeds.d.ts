declare global {
  namespace Teriock.EmbedData {
    export type EmbedIcon = {
      action?: string;
      classes?: string;
      clickable?: boolean;
      dataset?: object;
      icon?: Teriock.EmbedData.EmbedIcon;
      tooltip?: string;
      visible?: (() => boolean) | boolean;
      onClick?: (event: PointerEvent, relative: TeriockDocument) => Promise<void>;
    };

    export type EmbedParts = {
      action?: string;
      color?: string;
      draggable?: boolean;
      hidden?: boolean;
      icons?: Teriock.EmbedData.EmbedIcon[];
      id?: ID<AnyCommonDocument>;
      /** Clicking the block opens whatever this refers to, in preference to `openable`. */
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

    export type EmbedAction = {
      primary: (event: PointerEvent, relative: TeriockDocument) => Promise<void>;
      secondary?: (event: PointerEvent, relative: TeriockDocument) => Promise<void>;
    };
  }
}

export {};
