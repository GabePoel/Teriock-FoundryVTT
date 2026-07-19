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
      teriock?: { maximizeOnDragEnter?: boolean, minimizeOnDragStart?: boolean };
    };

    export type DragDropConfiguration = { dragDrop: Teriock.Application.DragDropSelector[] };

    export type DragDropSelector = { dragSelector: string | null, dropSelector: string | null };

    export type DropEffect = "copy" | "link" | "move" | "none";

    export type DropData<T> = {
      data?: T;
      document?: T;
      identifier?: TypedIdentifier;
      interactive?: boolean;
      type: "ActiveEffect" | "Actor" | "Automation" | "Item" | "JournalEntryPage" | "Macro";
      uuid: UUID<T>;
    };
  }
}

export {};
