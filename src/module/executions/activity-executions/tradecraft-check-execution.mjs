import { BaseExecution } from "../abstract/_module.mjs";
import * as executionMixins from "../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes TradecraftExecution
 * @property {Teriock.Execution.ThresholdExecutionOptions} options
 */
export default class TradecraftCheckExecution extends executionMixins.TradecraftExecutionMixin(BaseExecution) {
  /**
   * @param {object} [data]
   * @param {Teriock.Execution.ThresholdExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options);
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
    return this.source.key;
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push(await (await teriock.fromIdentifier(`tradecraft:${this.tradecraft}`))?.toPanel());
  }
}
