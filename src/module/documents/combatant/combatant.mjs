import { EmbeddableDataMixin } from "../../data/mixins/_module.mjs";
import { CompetenceModel } from "../../data/models/scaling-models/_module.mjs";
import { ThresholdRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { addFormula } from "../../helpers/formula.mjs";
import { dotJoin } from "../../helpers/string.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Combatant } = foundry.documents;

/**
 * The Teriock Combatant implementation.
 * @mixes BaseDocument
 * @mixes EmbeddableData
 */
export default class TeriockCombatant extends mixClasses(Combatant, BaseDocumentMixin, EmbeddableDataMixin) {
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

  /**
   * If this is the commander of a combat group.
   * @returns {boolean}
   */
  get isCommander() {
    return this.group?.system?.commander === this;
  }

  /** @inheritDoc */
  _getInitiativeFormula() {
    const base = TERIOCK.config.character.defaults.initiative.base;
    const competence = this.competence.formula ?? TERIOCK.config.character.defaults.initiative.competence;
    const bonus = this.actor?.system?.initiative?.bonus ?? TERIOCK.config.character.defaults.initiative.bonus;
    // Formula matches `InitiativeExecution`.
    return addFormula(addFormula(base, competence), bonus);
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);

    if ("initiative" in changed && this.isCommander) { this.group.update({ initiative: changed.initiative }); }
    else if ("group" in changed) {
      this.parent?.setupTurns();
      if (this.parent?.isViewer) { ui.combat.render(); }
    }
  }

  /**
   * @inheritDoc
   * @version 367
   */
  getInitiativeRoll(formula) {
    formula ||= this._getInitiativeFormula();
    const rollData = this.actor?.getRollData() || {};
    // Tags match `InitiativeExecution`.
    const rollOptions = { tags: [this.competence.label] };
    return new ThresholdRoll(formula, rollData, rollOptions);
  }

  /**
   * Make this into the commander of a group.
   * @returns {Promise<void>}
   */
  async makeCommander() {
    const groupId = this.group?.id ?? foundry.utils.randomID();
    if (this.group) {
      await this.group.update({ "system.commander": this.id });
    } else {
      await foundry.documents.modifyBatch([{
        action: "create",
        data: [{ _id: groupId, "system.commander": this.id, type: "commanded" }],
        documentName: "CombatantGroup",
        keepId: true,
        pack: this.pack,
        parent: this.parent,
      }, {
        action: "update",
        documentName: this.documentName,
        pack: this.pack,
        parent: this.parent,
        updates: [{ _id: this.id, group: groupId }],
      }]);
    }
  }
}
