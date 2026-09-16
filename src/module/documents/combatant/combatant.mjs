import { TeriockDialog } from "../../applications/api/_module.mjs";
import { EmbeddableDataMixin } from "../../data/mixins/_module.mjs";
import { CompetenceModel } from "../../data/models/scaling-models/_module.mjs";
import { ThresholdRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { addFormula } from "../../helpers/formula.mjs";
import { makeIconClass } from "../../helpers/icon.mjs";
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
   * The combatant group.
   * @returns {CombatantGroup}
   */
  get groupDocument() {
    if (typeof this.group === "string") { return this.parent.groups.get(this.group); }
    return this.group;
  }

  /**
   * If this is the commander of a combat group.
   * @returns {boolean}
   */
  get isCommander() {
    return this.group?.system?.commander === this;
  }

  /**
   * If this is a minion in a combat group.
   * @returns {boolean}
   */
  get isMinion() {
    return this.group && !this.isCommander;
  }

  /** @inheritDoc */
  get typeIcon() {
    if (this.isCommander) { return TERIOCK.display.icons.manifest.combat.commander; }
    if (this.isMinion) { return TERIOCK.display.icons.manifest.combat.minion; }
    return TERIOCK.display.icons.manifest.combat.combatant;
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
   * Join a combat group.
   * @param {TeriockCombatant|CombatantGroup} target
   * @returns {Promise<void>}
   */
  async joinGroup(target) {
    const groupId = target.documentName === "CombatantGroup"
      ? target.id
      : target.groupDocument?.id ?? foundry.utils.randomID();
    if (groupId === this.groupDocument?.id) { return; }
    const makeGroup = target.documentName === "Combatant" && !target.groupDocument;
    const operations = [];
    if (this.groupDocument?.members.size === 1 || this.isCommander) {
      operations.push({
        action: "delete",
        documentName: "CombatantGroup",
        ids: [this.groupDocument.id],
        pack: this.pack,
        parent: this.parent,
      });
    }
    if (makeGroup) {
      operations.push({
        action: "create",
        data: [{ _id: groupId, initiative: target.initiative, "system.commanderId": target.id, type: "commanded" }],
        documentName: "CombatantGroup",
        keepId: true,
        pack: this.pack,
        parent: this.parent,
      });
    }
    const updates = [];
    if (makeGroup) { updates.push({ _id: target.id, group: groupId }); }
    if (this.groupDocument) {
      updates.push(
        ...Array.from(this.groupDocument.members).map(m => {
          return { _id: m.id, group: groupId, initiative: target.initiative };
        }),
      );
    } else { updates.push({ _id: this.id, group: groupId, initiative: target.initiative }); }
    operations.push({
      action: "update",
      documentName: this.documentName,
      pack: this.pack,
      parent: this.parent,
      updates,
    });
    await foundry.documents.modifyBatch(operations);
  }

  /**
   * Leave a combat group.
   * @returns {Promise<void>}
   */
  async leaveGroup() {
    if (!this.groupDocument) { return; }
    const operations = [];
    const deleteGroup = this.groupDocument.members.size === 1
      || (this.isCommander
        && await TeriockDialog.confirm({
          content: `<p>${_loc("COMBATANT.ACTIONS.ConfirmDeleteGroup")}</p>`,
          window: {
            icon: makeIconClass(TERIOCK.display.icons.manifest.combat.combatant, "title"),
            title: _loc("COMBATANT.ACTIONS.LeaveGroup"),
          },
        }));
    if (deleteGroup) {
      operations.push(...[{
        action: "delete",
        documentName: "CombatantGroup",
        ids: [this.groupDocument.id],
        pack: this.pack,
        parent: this.parent,
      }, {
        action: "update",
        documentName: "Combatant",
        pack: this.pack,
        parent: this.parent,
        updates: Array.from(this.groupDocument.members).map(m => {
          return { _id: m.id, group: null };
        }),
      }]);
    } else {
      operations.push({
        action: "update",
        documentName: "Combatant",
        pack: this.pack,
        parent: this.parent,
        updates: [{ _id: this.id, group: null }],
      });
    }
    await foundry.documents.modifyBatch(operations);
  }

  /**
   * Make this into the commander of a combat group.
   * @returns {Promise<void>}
   */
  async makeCommander() {
    const groupId = this.groupDocument?.id ?? foundry.utils.randomID();
    const operations = [];
    if (this.groupDocument) {
      operations.push({
        action: "update",
        documentName: "CombatantGroup",
        pack: this.pack,
        parent: this.parent,
        updates: [{ _id: groupId, initiative: this.initiative, "system.commanderId": this.id }],
      });
    } else {
      operations.push({
        action: "create",
        data: [{ _id: groupId, initiative: this.initiative, "system.commanderId": this.id, type: "commanded" }],
        documentName: "CombatantGroup",
        keepId: true,
        pack: this.pack,
        parent: this.parent,
      });
    }
    operations.push({
      action: "update",
      documentName: "Combatant",
      pack: this.pack,
      parent: this.parent,
      updates: [{ _id: this.id, group: groupId }],
    });
    await foundry.documents.modifyBatch(operations);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.groupDocument && this.isMinion) {
      this.initiative = this.groupDocument.system?.commander?.initiative ?? this.groupDocument.initiative;
    }
  }
}
