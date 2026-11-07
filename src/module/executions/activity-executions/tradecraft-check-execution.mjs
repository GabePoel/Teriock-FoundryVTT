import { mixClasses } from "../../utils/_module.mjs";
import { BaseExecution } from "../abstract/_module.mjs";
import { TradecraftExecutionMixin } from "../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes TradecraftExecution
 * @property {Teriock.Execution.ThresholdExecutionOptions} options
 */
export default class TradecraftCheckExecution extends mixClasses(BaseExecution, TradecraftExecutionMixin) {
  /** @inheritDoc */
  get name() {
    return this.source.useText;
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
    this.panels.push(Object.assign(await this.journalEntryPage?.getPanelParts(), { collapsed: true }));
  }
}
