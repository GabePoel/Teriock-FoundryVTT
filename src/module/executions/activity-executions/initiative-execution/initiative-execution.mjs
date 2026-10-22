import { FormulaField } from "../../../data/fields/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { mixClasses } from "../../../utils/_module.mjs";
import { DocumentExecution } from "../../abstract/_module.mjs";
import { ThresholdExecutionMixin } from "../../mixins/_module.mjs";

/**
 * @import { InitiativeModel } from "../../../data/models/modifier-models/_module.mjs";
 */

/**
 * @extends {DocumentExecution}
 * @mixes ThresholdExecution
 */
export default class InitiativeExecution extends mixClasses(DocumentExecution, ThresholdExecutionMixin) {
  /**
   * Get the default initiative formula or one derived from an InitiativeModel.
   * @param {InitiativeModel} [model]
   * @returns {Teriock.System.FormulaString}
   */
  static getFormula(model) {
    const defaults = TERIOCK.CONFIG.character.defaults.initiative;
    return FormulaField.sum(
      defaults.base,
      model?.competence.formula ?? defaults.competence,
      model?.bonus ?? defaults.bonus,
    );
  }

  /** @inheritDoc */
  get _dialogDocuments() {
    const docs = super._dialogDocuments;
    if (this.source.documentName === "CombatantGroup") {
      docs[0].label = _loc("DOCUMENT.CombatantGroup");
      docs.push({
        document: this.roller,
        editable: true,
        label: _loc("DOCUMENT.Combatant"),
        selectHint: "TERIOCK.DIALOGS.Select.Combatant.hint",
        selectTitle: "TERIOCK.DIALOGS.Select.Combatant.title",
        getChoices: () => [...this.source.members],
        update: roller => {
          this.roller = /** @type {TeriockCombatant} */ (roller);
          this._actor = this.roller.actor;
          this.updateSource({
            bonus: this.roller.initiativeModel.bonus,
            "competence.raw": this.roller.initiativeModel.competence.raw,
          });
        },
      });
    }
    return docs;
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
        actor: this.roller.actor,
        alias: this.source.name,
        img: this.source.img,
        token: this.roller.token,
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
    this.rolls.push(this.roller.getInitiativeRoll(this.formula));
  }

  /** @inheritDoc */
  async _buildSourcePanel() {
    return false;
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.InitiativeExecutionOptions>} [options]
   */
  _configure(options = {}) {
    super._configure(options);
    if (!options.messageMode && this.roller?.hidden) { this._messageMode = "gm"; }
  }

  /** @inheritDoc */
  _determineCompetence(options) {
    return this.roller?.initiativeModel?.competence.raw ?? super._determineCompetence(options);
  }

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.InitiativeExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    this.roller = options.roller ?? options.source?.turnHolder ?? options.source;
    foundry.utils.mergeObject(data, {
      bonus: this.roller?.initiativeModel?.bonus ?? TERIOCK.CONFIG.character.defaults.initiative.bonus,
      ...ui.combat.defaultInitiativeExecutionData,
    }, { inplace: true, overwrite: false });
    ui.combat.defaultInitiativeExecutionData = {};
    return super._initializeSource(data, options);
  }

  /** @inheritDoc */
  _resolveActor(options) {
    return options.actor ?? this.roller?.actor ?? game.actors.default;
  }

  /** @inheritDoc */
  getRollData() {
    return this.roller?.actor?.getRollData?.() ?? {};
  }
}
