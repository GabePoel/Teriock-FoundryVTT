import { cleanDataset } from "../../html.mjs";
import { makeIconClass } from "../../utils.mjs";
import AbstractInteractionHandler from "../abstract-interaction-handler.mjs";

/**
 * Handler for calling actions when clicking on buttons in chat messages.
 * @template {DOMStringMap} [TDataset=DOMStringMap]
 */
export default class BaseButtonHandler extends AbstractInteractionHandler {
  /**
   * Name of action to connect to listeners.
   * @type {string}
   */
  static ACTION = "";

  /**
   * @param {PointerEvent} event
   * @param {HTMLElement} element
   */
  constructor(event, element) {
    super();
    event.stopPropagation();
    this.event = event;
    this.element = element;
    this.dataset = this.element.dataset;
    if (event.ctrlKey) {
      this.tokens = this.targetedTokens;
      this.actors = this.targetedActors;
    }
    this.options = cleanDataset(this.dataset);
  }

  /**
   * Build a button this handler can fire from.
   * @returns {Teriock.UI.HTMLButtonConfig}
   */
  static buildButton() {
    return {
      icon: makeIconClass(TERIOCK.display.icons.ui.enable, "button"),
      dataset: {
        action: this.ACTION,
      },
      label: "Action",
    };
  }

  /**
   * Left-click action.
   * @returns {Promise<void>}
   * @abstract
   */
  async primaryAction() {}

  /**
   * Right-click action.
   * @returns {Promise<void>}
   * @abstract
   */
  async secondaryAction() {}
}
