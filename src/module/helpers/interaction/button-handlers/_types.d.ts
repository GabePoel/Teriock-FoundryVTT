import AbstractInteractionHandler from "../abstract-interaction-handler.mjs";

declare module "./base-button-handler.mjs" {
  export default interface ActionHandler extends AbstractInteractionHandler {
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
