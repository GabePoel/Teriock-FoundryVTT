import { FormulaField } from "../../data/fields/_module.mjs";
import { EmbeddableDataMixin } from "../../data/mixins/_module.mjs";
import { ThresholdRoll } from "../../dice/rolls/_module.mjs";
import { dotJoin, mixClasses } from "../../utils/_module.mjs";
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
export default class TeriockCombatant extends mixClasses(Combatant, BaseDocumentMixin, EmbeddableDataMixin) {
  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    return Object.assign(parts, {
      inactive: this.isDefeated,
      struck: this.isDefeated,
      subtitle: _loc("DOCUMENT.Combatant"),
      text: dotJoin([
        this.isDefeated ? _loc("TERIOCK.SYSTEMS.Combatant.EMBED.defeated") : "",
        this.hidden ? _loc("TERIOCK.SYSTEMS.Combatant.EMBED.hidden") : "",
        parts.text,
      ]),
    });
  }

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
    return FormulaField.sum(base, competence, bonus);
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
