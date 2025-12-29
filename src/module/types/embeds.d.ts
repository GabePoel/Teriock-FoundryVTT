declare global {
  namespace Teriock.EmbedData {
    export type EmbedIcon = {
      action?: string;
      callback?: (
        event: PointerEvent,
        relative: TeriockDocument,
      ) => Promise<void>;
      classes?: string;
      clickable?: boolean;
      dataset?: object;
      icon?: Teriock.EmbedData.EmbedIcon;
      tooltip?: string;
      condition?: boolean;
    };
    export type EmbedParts = {
      action?: string;
      color?: string;
      draggable?: boolean;
      hidden?: boolean;
      icons?: Teriock.EmbedData.EmbedIcon[];
      id?: ID<TeriockCommon>;
      img: string;
      inactive?: boolean;
      makeTooltip?: boolean;
      openable?: boolean;
      parentId?: ID<TeriockCommon>;
      relative?: UUID<TeriockDocument>;
      shattered?: boolean;
      struck?: boolean;
      subtitle?: string;
      subtitleAction?: string;
      subtitleTooltip?: string;
      text?: string;
      title: string;
      tooltip?: string;
      usable?: boolean;
      uuid?: UUID<TeriockCommon>;
    };
    export type EmbedAction = {
      primary: (
        event: PointerEvent,
        relative: TeriockDocument,
      ) => Promise<void>;
      secondary?: (
        event: PointerEvent,
        relative: TeriockDocument,
      ) => Promise<void>;
    };
  }
}

export {};
