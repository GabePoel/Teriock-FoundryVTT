import InteractionHandler from "../interaction-handler.mjs";

declare module "./abstract-button-handler.mjs" {
  export default interface ActionHandler extends InteractionHandler {
    /** Dataset */
    dataset: DOMStringMap;
    /** HTML Element */
    element: HTMLElement;
    /** Triggering Mouse Event */
    event: MouseEvent;

    primaryAction(): Promise<void>;

    secondaryAction(): Promise<void>;
  }
}
