import { mixClasses } from "../../helpers/construction.mjs";
import { BaseExecution } from "../abstract/_module.mjs";
import { AttackExecutionMixin } from "../mixins/_module.mjs";

/**
 * An attack roll that has no ability associated with it.
 * @mixes AttackExecution
 */
export default class AttackRollExecution extends mixClasses(BaseExecution, AttackExecutionMixin) {
  /**
   * @param {object} [data]
   * @param {Teriock.Execution.AttackExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    data.consumeAmmunition ??= game.settings.get("teriock", "ability").consumeAmmunition;
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
    return TERIOCK.display.icons.manifest.interaction.attack;
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
