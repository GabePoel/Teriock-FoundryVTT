import BaseRoll from "./base-roll.mjs";

const { setProperty, getProperty } = foundry.utils;

/** @inheritDoc */
export default class ThresholdRoll extends BaseRoll {
  /**
   * @inheritDoc
   * @returns {Teriock.Dice.ThresholdRollOptions}
   */
  static get defaultOptions() {
    return Object.assign(super.defaultOptions, {
      critSuccessThreshold: 20,
      critFailureThreshold: 1,
    });
  }

  /**
   * @inheritDoc
   * @param {PointerEvent} event
   * @returns {Teriock.Interaction.ThresholdOptions}
   */
  static parseEvent(event) {
    return Object.assign(super.parseEvent(event), {
      edge: Number(event?.altKey || false) - Number(event?.shiftKey || false),
    });
  }

  /**
   * Whether this is a crit failure.
   * @returns {boolean}
   */
  get critFailure() {
    return this.dice.some((d) => d.total <= this.options.critFailureThreshold);
  }

  /**
   * Whether this is a crit success.
   * @returns {boolean}
   */
  get critSuccess() {
    return this.dice.some((d) => d.total >= this.options.critSuccessThreshold);
  }

  /** @inheritDoc */
  get failure() {
    return super.failure || this.critFailure;
  }

  /** @inheritDoc */
  get success() {
    return super.success || this.critSuccess;
  }

  /** @inheritDoc */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    if (this.critSuccess) {
      const classes = getProperty(context, "styles.total.classes") ?? "";
      setProperty(context, "styles.total.classes", classes + " crit-success");
      setProperty(
        context,
        "styles.total.tooltip",
        _loc("TERIOCK.ROLLS.Base.critSuccess"),
      );
    }
    if (this.critFailure) {
      const classes = getProperty(context, "styles.total.classes") ?? "";
      setProperty(context, "styles.total.classes", classes + " crit-failure");
      setProperty(
        context,
        "styles.total.tooltip",
        _loc("TERIOCK.ROLLS.Base.critFailure"),
      );
    }
    return context;
  }
}
