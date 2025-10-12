import { systemPath } from "../helpers/path.mjs";

const { Roll } = foundry.dice;

/** @inheritDoc */
export default class TeriockRoll extends Roll {
  /** @inheritDoc */
  static CHAT_TEMPLATE = systemPath("templates/message-templates/roll.hbs");

  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.context = options.context || {};
  }

  /**
   * Minimum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @returns {number}
   */
  static maxValue(formula, data = {}) {
    const maxRoll = new TeriockRoll(formula, data);
    return maxRoll.evaluateSync({ maximize: true }).total;
  }

  /**
   * Mean value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @returns {number}
   */
  static meanValue(formula, data = {}) {
    const maxValue = this.maxValue(formula, data);
    const minValue = this.minValue(formula, data);
    return (maxValue + minValue) / 2;
  }

  /**
   * Maximum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @returns {number}
   */
  static minValue(formula, data = {}) {
    const minRoll = new TeriockRoll(formula, data);
    return minRoll.evaluateSync({ minimize: true }).total;
  }

  /** @inheritDoc */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    if (this.context) {
      Object.assign(context, this.context);
    }
    return context;
  }
}
