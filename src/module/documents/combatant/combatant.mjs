import { ThresholdRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { addFormulas } from "../../helpers/formula.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

/**
 * @import { InitiativeModel } from "../../data/models/modifier-models/_module.mjs";
 */

const { Combatant } = foundry.documents;

/**
 * The Teriock Combatant implementation.
 * @extends {Combatant}
 * @mixes BaseDocument
 */
export default class TeriockCombatant extends mixClasses(Combatant, BaseDocumentMixin) {
  /**
   * The initiative model to use.
   * @returns {InitiativeModel}
   */
  get initiativeModel() {
    return this.actor?.system?.initiative ?? this.system.initiative;
  }

  /**
   * @inheritDoc
   * @version 368
   */
  _getInitiativeFormula() {
    const base = TERIOCK.config.character.defaults.initiative.base;
    const competence = this.initiativeModel.competence.formula
      ?? TERIOCK.config.character.defaults.initiative.competence;
    const bonus = this.initiativeModel.bonus ?? TERIOCK.config.character.defaults.initiative.bonus;
    // Formula matches `InitiativeExecution`.
    return addFormulas(base, competence, bonus);
  }

  /**
   * @inheritDoc
   * @version 368
   */
  getInitiativeRoll(formula) {
    formula ||= this._getInitiativeFormula();
    const rollData = this.actor?.getRollData() || {};
    // Tags match `InitiativeExecution`.
    const rollOptions = { tags: [this.initiativeModel.competence.label] };
    return new ThresholdRoll(formula, rollData, rollOptions);
  }
}
