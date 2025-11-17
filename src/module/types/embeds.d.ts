declare global {
  namespace Teriock.EmbedData {
    export type EmbedIcon = {
      action?: string;
      callback?: (event: PointerEvent) => Promise<void>;
      classes?: string;
      clickable?: boolean;
      dataset?: object;
      icon: string;
      tooltip?: string;
      condition?: boolean;
    };
    export type EmbedParts = {
      action?: string;
      color?: string;
      draggable?: boolean;
      hidden?: boolean;
      icons?: Teriock.EmbedData.EmbedIcon[];
      id?: Teriock.ID<TeriockCommon>;
      img: string;
      inactive?: boolean;
      makeTooltip?: boolean;
      openable?: boolean;
      parentId?: Teriock.ID<TeriockCommon>;
      relative?: Teriock.UUID<TeriockDocument>;
      shattered?: boolean;
      struck?: boolean;
      subtitle?: string;
      subtitleAction?: string;
      subtitleTooltip?: string;
      text?: string;
      title: string;
      tooltip?: string;
      usable?: boolean;
      uuid?: Teriock.UUID<TeriockCommon>;
    };
  }
}

export {};
