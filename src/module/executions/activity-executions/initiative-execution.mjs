import { TeriockChatMessage } from "../../documents/_module.mjs";
import { DocumentExecution } from "../abstract/_module.mjs";
import * as executionMixins from "../mixins/_module.mjs";

/**
 * @extends {DocumentExecution}
 * @mixes ThresholdExecution
 * @property {TeriockCombatant} source
 */
export default class InitiativeExecution extends executionMixins.ThresholdExecutionMixin(DocumentExecution) {
  constructor(data = {}, options = {}) {
    foundry.utils.mergeObject(data, {
      bonus: options.source?.actor?.system?.initiative?.raw ?? TERIOCK.config.character.defaults.initiative.bonus,
      ...ui.combat.defaultInitiativeExecutionData,
    }, { inplace: true, overwrite: false });
    ui.combat.defaultInitiativeExecutionData = {};
    super(data, options);
    if (!options.messageMode && this.source.hidden) { this._messageMode = "gm"; }
  }

  /** @inheritDoc */
  get _dialogDocuments() {
    return super._dialogDocuments.map(d => Object.assign(d, { openable: false }));
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
    return TERIOCK.display.icons.interaction.attack;
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.EXECUTIONS.Initiative.NAME", { name: foundry.utils.escapeHTML(this.source.name) });
  }

  /** @inheritDoc */
  async _buildRolls() {
    this.rolls.push(this.source.getInitiativeRoll(this.formula));
  }

  /** @inheritDoc */
  getRollData() {
    return this.source?.actor?.getRollData?.() ?? {};
  }
}
