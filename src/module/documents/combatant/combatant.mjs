import { CompetenceModel } from "../../data/models/scaling-models/_module.mjs";
import { ThresholdRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { addFormula } from "../../helpers/formula.mjs";
import { dotJoin } from "../../helpers/string.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { Combatant } = foundry.documents;

/**
 * The Teriock Combatant implementation.
 * @implements {Teriock.Documents.CombatantInterface}
 * @extends {ClientDocument}
 * @extends {Combatant}
 * @mixes BaseDocument
 * @mixes EmbedCardDocument
 */
export default class TeriockCombatant
  extends mixClasses(Combatant, documentMixins.BaseDocumentMixin, documentMixins.EmbedCardDocumentMixin)
{
  /**
   * Competence for this combatant's initiative.
   * @type {CompetenceModel}
   */
  #competence = new CompetenceModel({ raw: 1 });

  /**
   * Competence for this combatant's initiative.
   * @returns {CompetenceModel}
   */
  get competence() {
    return this.actor?.system?.initiative?.competence ?? this.#competence;
  }

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

  /** @inheritDoc */
  _getInitiativeFormula() {
    const base = TERIOCK.config.character.defaults.initiative.base;
    const competence = this.competence.formula ?? TERIOCK.config.character.defaults.initiative.competence;
    const bonus = this.actor?.system?.initiative?.raw ?? TERIOCK.config.character.defaults.initiative.bonus;
    // Formula matches `InitiativeExecution`.
    return addFormula(addFormula(base, competence), bonus);
  }

  /** @inheritDoc */
  getInitiativeRoll(formula) {
    formula ||= this._getInitiativeFormula();
    const rollData = this.actor?.getRollData() || {};
    // Tags match `InitiativeExecution`.
    const rollOptions = { tags: [this.competence.label] };
    return new ThresholdRoll(formula, rollData, rollOptions);
  }
}
