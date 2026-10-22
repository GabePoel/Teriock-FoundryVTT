import { EmbeddableDataMixin, PanelDataMixin } from "../../data/mixins/_module.mjs";
import { ThresholdRoll } from "../../dice/rolls/_module.mjs";
import { InitiativeExecution } from "../../executions/activity-executions/_module.mjs";
import { dotJoin, makeIconClass, mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

/**
 * @import { InitiativeModel } from "../../data/models/modifier-models/_module.mjs";
 */

const { Combatant } = foundry.documents;

/**
 * The Teriock Combatant implementation.
 * @extends {Combatant}
 * @mixes BaseDocument
 * @mixes PanelData
 */
export default class TeriockCombatant
  extends mixClasses(Combatant, BaseDocumentMixin, EmbeddableDataMixin, PanelDataMixin)
{
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
   * Whether this is the commander of its CombatantGroup.
   * @returns {boolean}
   */
  get isCommander() {
    return Boolean(this.group) && this.group.system.commander === this;
  }

  /**
   * The Combatants that act on this Combatant's turn.
   * @returns {TeriockCombatant[]}
   */
  get turnMembers() {
    return this.group?.turnMembers ?? [this];
  }

  /** @inheritDoc */
  get typeIcon() {
    const tagIcon = this.system.tagIcon;
    return tagIcon ? makeIconClass(tagIcon.icon, "title") : super.typeIcon;
  }

  /**
   * @inheritDoc
   * @version 369
   */
  _getInitiativeFormula() {
    return InitiativeExecution.getFormula(this.initiativeModel);
  }

  /** @inheritDoc */
  _prepareGroup() {
    // Fix for core leaving the group even when it doesn't exist.
    this.group = null;
    super._prepareGroup();
    // Core only shares a CombatantGroup's initiative once it is set.
    if (this.group) { this.initiative = this.group.initiative; }
  }

  /**
   * @inheritDoc
   * @version 369
   */
  getInitiativeRoll(formula) {
    formula ||= this._getInitiativeFormula();
    const rollData = this.actor?.getRollData() || {};
    // Tags match `InitiativeExecution`.
    const rollOptions = { tags: [this.initiativeModel.competence.label] };
    return new ThresholdRoll(formula, rollData, rollOptions);
  }
}
