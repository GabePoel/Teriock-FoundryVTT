import { tradecraftPanel } from "../../../helpers/html.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";
import { TradecraftExecutionMixin } from "../../mixins/_module.mjs";

export default class TradecraftCheckExecution extends TradecraftExecutionMixin(
  BaseExecution,
) {
  /**
   * @param {Teriock.Execution.TradecraftExecutionOptions} options
   */
  constructor(
    options = /** @type {Teriock.Execution.TradecraftExecutionOptions} */ {},
  ) {
    super(options);
    this._tradecraft = options.tradecraft;
    if (this.actor) {
      if (options.proficient === undefined) {
        this.proficient =
          this.actor.system.tradecrafts[options.tradecraft].isProficient;
      }
      if (options.fluent === undefined) {
        this.fluent =
          this.actor.system.tradecrafts[options.tradecraft].isFluent;
      }
      if (options.bonus === undefined) {
        this.bonus = this.actor.system.tradecrafts[options.tradecraft].formula;
      }
    }
  }

  /** @inheritDoc */
  get rollOptions() {
    const options = super.rollOptions;
    options.targets = Array.from(game.user.targets);
    return options;
  }

  /** @inheritDoc */
  get tradecraft() {
    return this._tradecraft;
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push(await tradecraftPanel(this.tradecraft));
  }
}
