import BaseRoll from "./base-roll.mjs";

/** @inheritDoc */
export default class ThresholdRoll extends BaseRoll {
  /**
   * @inheritDoc
   * @returns {Teriock.Dice.ThresholdRollOptions}
   */
  static get defaultOptions() {
    return Object.assign(super.defaultOptions, {
      comparison: "gte",
      critFailureThreshold: 1,
      critSuccessThreshold: 20,
      threshold: null,
    });
  }

  /**
   * @inheritDoc
   * @param {PointerEvent} event
   * @returns {Teriock.Command.ThresholdOptions}
   */
  static parseEvent(event) {
    return Object.assign(super.parseEvent(event), {
      edge: Number(event?.altKey || false) - Number(event?.shiftKey || false),
    });
  }

  /**
   * Whether the threshold has been met, ignoring crits.
   * @returns {boolean}
   */
  get #thresholdMet() {
    return this.hasThreshold
      && BaseRoll.qualify(`${this.options.comparison}(${this.total}, ${this.options.threshold})`, {});
  }

  /**
   * Whether this is a crit failure.
   * @returns {boolean}
   */
  get critFailure() {
    return Boolean(this.dice.length) && this.dice[0].total <= this.options.critFailureThreshold;
  }

  /**
   * Whether this is a crit success.
   * @returns {boolean}
   */
  get critSuccess() {
    return Boolean(this.dice.length) && this.dice[0].total >= this.options.critSuccessThreshold;
  }

  /**
   * Whether this threshold has not been met.
   * @returns {boolean}
   */
  get failure() {
    return (this.hasThreshold && !this.success) || this.critFailure;
  }

  /**
   * Whether this has a threshold.
   * @returns {boolean}
   */
  get hasThreshold() {
    return Number.isFinite(this.options.threshold);
  }

  /**
   * Whether this threshold has been met.
   * @returns {boolean}
   */
  get success() {
    return this.#thresholdMet || this.critSuccess;
  }

  /** @inheritDoc */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    if (!options.isPrivate) {
      if (this.success) {
        context.styles.total.classes.push("success");
        context.styles.total.tooltip = _loc("TERIOCK.ROLLS.Base.success");
        context.styles.total.icon = TERIOCK.display.icons.ui.enable;
      } else if (this.failure) {
        context.styles.total.classes.push("failure");
        context.styles.total.tooltip = _loc("TERIOCK.ROLLS.Base.failure");
        context.styles.total.icon = TERIOCK.display.icons.ui.disable;
      }
      if (this.critSuccess) {
        context.styles.total.classes.push("crit-success");
        context.styles.total.tooltip = _loc("TERIOCK.ROLLS.Base.critSuccess");
      }
      if (this.critFailure) {
        context.styles.total.classes.push("crit-failure");
        context.styles.total.tooltip = _loc("TERIOCK.ROLLS.Base.critFailure");
      }
    }
    return context;
  }
}
