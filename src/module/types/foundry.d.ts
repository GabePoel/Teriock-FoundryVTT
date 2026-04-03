declare global {
  namespace Teriock.Foundry {
    export type BarField = {
      max: number;
      min: number;
      value: number;
    };

    export type ContextMenuCallback = (target: HTMLElement) => unknown;

    export type ContextMenuOptions = {
      eventName?: string;
      fixed?: boolean;
      jQuery?: boolean;
      onClose?: ContextMenuCallback;
      onOpen?: ContextMenuCallback;
      forceDirection?: "up" | "down";
    };
  }
}

export {};
