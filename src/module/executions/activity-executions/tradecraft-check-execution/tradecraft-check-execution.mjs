import BaseExecution from "../../base-execution/base-execution.mjs";
import { TradecraftExecutionMixin } from "../../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes TradecraftExecution
 * @property {Teriock.Execution.TradecraftExecutionOptions} options
 */
export default class TradecraftCheckExecution extends TradecraftExecutionMixin(BaseExecution) {
  /**
   * @param {Teriock.Execution.TradecraftExecutionOptions} options
   */
  constructor(options = /** @type {Teriock.Execution.TradecraftExecutionOptions} */ {}) {
    super(options);
    this._tradecraft = options.tradecraft;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      system: { _src: game.teriock.identifiers.get(`tradecraft:${this.tradecraft}`) },
    });
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.ROLLS.Tradecraft.name", { value: TERIOCK.reference.tradecrafts[this.tradecraft] });
  }

  /** @inheritDoc */
  get rollOptions() {
    return Object.assign(super.rollOptions, { targets: Array.from(game.user.targets) });
  }

  /** @inheritDoc */
  get tradecraft() {
    return this._tradecraft ?? this.options.tradecraft;
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push(await (await teriock.fromIdentifier(`tradecraft:${this.tradecraft}`))?.toPanel());
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.TradecraftExecutionOptions} options
   */
  _determineCompetence(options) {
    if (this.actor) { this.competence.raw = this.actor.system.tradecrafts[options.tradecraft].competence.value; }
    super._determineCompetence(options);
  }
}
