import { mixClasses } from "../../helpers/construction.mjs";
import { BaseExecution } from "../abstract/_module.mjs";
import { AttackExecutionMixin } from "../mixins/_module.mjs";

/**
 * An attack roll that has no ability associated with it.
 * @extends {BaseExecution}
 * @mixes AttackExecution
 */
export default class AttackRollExecution extends mixClasses(BaseExecution, AttackExecutionMixin) {
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

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.AttackExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    data.consumeAmmunition ??= game.settings.get("teriock", "ability").consumeAmmunition;
    return super._initializeSource(data, options);
  }
}
