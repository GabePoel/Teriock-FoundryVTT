declare global {
  namespace Teriock.Application {
    /**
     * A double-click action. Handlers are registered in {@link Teriock.Application._ApplicationConfiguration.doubles}
     * and invoked in the context of the application instance when the user double-clicks an element that declares a
     * matching `data-double` attribute.
     * @param event - The originating double-click event.
     * @param target - The nearest ancestor of the event target that defines `data-double`.
     */
    export type ApplicationDoubleAction = (event: MouseEvent, target: HTMLElement) => Promise<void> | void;

    /**
     * Custom Teriock-specific configuration merged into {@link ApplicationConfiguration}.
     */
    export type _ApplicationConfiguration = {
      /**
       * Double-click actions supported by the application and their handler functions. Elements declare an action name
       * via the `data-double` attribute. A single frame-level listener dispatches double-clicks to the matching
       * handler, mirroring Foundry's `data-action` / `actions` pattern.
       */
      doubles?: Partial<Record<string, ApplicationDoubleAction>>;
      teriock?: {
        /** Time to wait before firing a single click action if a double click is not detected. */
        doubleClickDelay?: number;
        /** Drag and drop configuration */
        dragDrop?: {
          /** Whether to bind callbacks */
          bind?: { dragEnter?: boolean, dragLeave?: boolean, dragOver?: boolean, dragStart?: boolean, drop?: boolean };
          /** Drop behavior customization */
          dropBehavior?: {
            /** Whether to treat drops as potential child documents */
            child?: boolean;
            /** Default drop effect */
            effect?: Teriock.Application.DropEffect;
            /** Whether to inherit default drop behavior from parent Foundry class */
            inherit?: boolean;
          };
          /** CSS selectors */
          selectors?: { drag?: string | null, drop?: string | null };
          /** Style customization */
          style?: {
            /** Class to apply to the drop target if styled */
            dropTargetClass?: string;
            /** If this should maximize when something is dragged into it. */
            maximizeOnDragEnter?: boolean;
            /** If this should minimize when something is dragged out of it. */
            minimizeOnDragStart?: boolean;
            /** If the drop target should be highlighted */
            styleDropTarget?: boolean;
          };
        };
        /** Whether this should start locked */
        startLocked?: boolean | null;
      };
    };

    export type DragDropConfiguration = { dragDrop: Teriock.Application.DragDropSelector[] };

    export type DragDropSelector = { dragSelector: string | null, dropSelector: string | null };

    export type DropEffect = "copy" | "link" | "move" | "none";

    export type DropData<T> = { identifier?: TypedIdentifier, interactive?: boolean, type: string, uuid: UUID<T> };

    export type DragDropPayload<T> = DropData<T> & { document?: T };

    export type DropValidationOptions = {
      document?: TeriockActiveEffect | TeriockActor | TeriockItem;
      dropEffect?: DropEffect;
      notify?: boolean;
    };
  }
}

export {};
