/**
 * Handler for calling actions when clicking on buttons in chat messages.
 *
 * @template {DOMStringMap} [TDataset=DOMStringMap]
 */
export default class ActionHandler {
  /**
   * Name of action to connect to listeners.
   *
   * @type {string}
   */
  static ACTION = "";

  /**
   * @param {MouseEvent} event
   * @param {HTMLElement} element
   */
  constructor(event, element) {
    this.event = event;
    this.element = element;
    this.dataset = this.element.dataset;

    const tokenLayer = /** @type {TokenLayer} */ game.canvas.tokens;
    const user = /** @type {TeriockUser} */ game.user;

    this.selectedTokens = /** @type {TeriockTokenDocument[]} */ tokenLayer.controlled;
    this.selectedActors = /** @type {TeriockActor[]} */ this.selectedTokens.map(
      (t) => t.actor,
    );
    this.targetedTokens = /** @type {TeriockTokenDocument[]} */ Array.from(
      user.targets,
    );
    this.targetedActors = /** @type {TeriockActor[]} */ this.targetedTokens.map(
      (t) => t.actor,
    );
    this.tokens = this.selectedTokens;
    this.actors = this.selectedActors;
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
   * Left-click action.
   *
   * @returns {Promise<void>}
   */
  async primaryAction() {}

  /**
   * Right-click action.
   *
   * @returns {Promise<void>}
   */
  async secondaryAction() {}
}
