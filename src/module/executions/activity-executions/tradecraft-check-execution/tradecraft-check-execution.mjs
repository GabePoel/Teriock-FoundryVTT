import { tradecraftPanel } from "../../../helpers/panel.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";
import { TradecraftExecutionMixin } from "../../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes TradecraftExecution
 * @property {Teriock.Execution.TradecraftExecutionOptions} options
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
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.tradecraft[this.tradecraft];
  }

  /** @inheritDoc */
  get name() {
    return game.i18n.format("TERIOCK.ROLLS.Tradecraft.name", {
      value: TERIOCK.reference.tradecrafts[this.tradecraft],
    });
  }

  /** @inheritDoc */
  get rollOptions() {
    return Object.assign(super.rollOptions, {
      targets: Array.from(game.user.targets),
    });
  }

  /** @inheritDoc */
  get tradecraft() {
    return this._tradecraft ?? this.options.tradecraft;
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
    if (this.actor) {
      this.competence.raw =
        this.actor.system.tradecrafts[options.tradecraft].competence.value;
    }
    super._determineCompetence(options);
  }
}
