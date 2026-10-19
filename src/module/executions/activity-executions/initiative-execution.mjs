import { FormulaField } from "../../data/fields/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import characterConfig from "../../static/config/character-config.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { DocumentExecution } from "../abstract/_module.mjs";
import { ThresholdExecutionMixin } from "../mixins/_module.mjs";

/**
 * @extends {DocumentExecution}
 * @mixes ThresholdExecution
 * @property {TeriockCombatant} source
 */
export default class InitiativeExecution extends mixClasses(DocumentExecution, ThresholdExecutionMixin) {
  /**
   * The default initiative formula.
   * @type {Teriock.System.FormulaString}
   */
  static get DEFAULT_FORMULA() {
    return FormulaField.sum(
      characterConfig.defaults.initiative.base,
      characterConfig.defaults.initiative.competence,
      characterConfig.defaults.initiative.bonus,
    );
  }

  /** @inheritDoc */
  get canShareRoll() {
    return false;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      "core.initiativeRoll": true,
      flavor: this.flavor,
      speaker: TeriockChatMessage.getSpeaker({
        actor: this.source.actor,
        alias: this.source.name,
        token: this.source.token,
      }),
    });
  }

  /** @inheritDoc */
  get flavor() {
    return _loc("COMBAT.RollsInitiative", { name: foundry.utils.escapeHTML(this.source.name) });
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.DISPLAY.icons.manifest.roll.initiative;
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.EXECUTIONS.Initiative.NAME", { name: foundry.utils.escapeHTML(this.source.name) });
  }

  /** @inheritDoc */
  async _buildRolls() {
    this.rolls.push(this.source.getInitiativeRoll(this.formula));
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ExecutionOptions>} [options]
   */
  _configure(options = {}) {
    super._configure(options);
    if (!options.messageMode && this.source.hidden) { this._messageMode = "gm"; }
  }

  /** @inheritDoc */
  _determineCompetence(options) {
    if (foundry.utils.hasProperty(options.source, "initiativeModel.competence.raw")) {
      return foundry.utils.getProperty(options.source, "initiativeModel.competence.raw");
    }
    return super._determineCompetence(options);
  }

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.ExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    foundry.utils.mergeObject(data, {
      bonus: options.source?.system?.initiative?.bonus ?? TERIOCK.CONFIG.character.defaults.initiative.bonus,
      ...ui.combat.defaultInitiativeExecutionData,
    }, { inplace: true, overwrite: false });
    ui.combat.defaultInitiativeExecutionData = {};
    return super._initializeSource(data, options);
  }

  /** @inheritDoc */
  getRollData() {
    return this.source?.actor?.getRollData?.() ?? {};
  }
}
