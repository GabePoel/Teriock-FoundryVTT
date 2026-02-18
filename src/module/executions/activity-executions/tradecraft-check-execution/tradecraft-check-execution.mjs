import { tradecraftPanel } from "../../../helpers/html.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";
import { TradecraftExecutionMixin } from "../../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes TradecraftExecution
 */
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
    if (this.actor && options.bonus === undefined) {
      this.bonus = this.actor.system.tradecrafts[options.tradecraft].formula;
    }
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.tradecraft[this.tradecraft];
  }

  /** @inheritDoc */
  get name() {
    return `${TERIOCK.index.tradecrafts[this.tradecraft]} Check`;
  }

  /** @inheritDoc */
  get rollOptions() {
    return Object.assign(super.rollOptions, {
      targets: Array.from(game.user.targets),
    });
  }

  /** @inheritDoc */
  get tradecraft() {
    return this._tradecraft;
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push(await tradecraftPanel(this.tradecraft));
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.TradecraftExecutionOptions} options
   */
  _determineCompetence(options) {
    if (!this.actor) return;
    if (options.proficient === undefined) {
      this.proficient =
        this.actor.system.tradecrafts[options.tradecraft].competence.proficient;
    }
    if (options.fluent === undefined) {
      this.fluent =
        this.actor.system.tradecrafts[options.tradecraft].competence.fluent;
    }
  }
}
