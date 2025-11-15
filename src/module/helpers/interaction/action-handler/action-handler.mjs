//noinspection JSUnusedGlobalSymbols

import InteractionHandler from "../interaction-handler.mjs";

/**
 * Handler for calling actions when clicking on buttons in chat messages.
 * @template {DOMStringMap} [TDataset=DOMStringMap]
 */
export default class ActionHandler extends InteractionHandler {
  /**
   * Name of action to connect to listeners.
   * @type {string}
   */
  static ACTION = "";

  /**
   * @param {MouseEvent} event
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
    this.commonRollOptions = {
      advantage: event.altKey,
      disadvantage: event.shiftKey,
    };
    this.critRollOptions = {
      crit: event.altKey,
    };
  }

  /**
   * Build a button this handler can fire from.
   * @returns {Teriock.UI.HTMLButtonConfig}
   */
  static buildButton() {
    return {
      icon: "fas fa-check",
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
