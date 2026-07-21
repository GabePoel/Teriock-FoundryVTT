import { BaseExecution } from "../abstract/_module.mjs";
import * as executionMixins from "../mixins/_module.mjs";

/**
 * An attack roll that has no ability associated with it.
 * @extends {BaseExecution}
 * @mixes AttackExecution
 */
export default class AttackRollExecution extends executionMixins.AttackExecutionMixin(BaseExecution) {
  /**
   * @param {object} [data]
   * @param {Teriock.Execution.AttackExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options);
    this.rootBonus = this.bonus;
    this.initializeExecution(options);
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      system: { _src: game.teriock.identifiers.get(this.journalEntryPageIdentifier) },
    });
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.interaction.attack;
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return "core:attack-interaction";
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.ROLLS.Attack.label");
  }
}
