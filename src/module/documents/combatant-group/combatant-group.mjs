import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { CombatantGroup } = foundry.documents;

/**
 * The Teriock CombatantGroup implementation.
 * @extends {CombatantGroup}
 * @mixes BaseDocument
 */
export default class TeriockCombatantGroup extends mixClasses(CombatantGroup, BaseDocumentMixin) {
  /**
   * The member that holds this CombatantGroup's place in the turn order.
   * @returns {TeriockCombatant|null}
   */
  get turnHolder() {
    const candidates = [this.system.commander, ...[...this.members].sort((a, b) => a.id.localeCompare(b.id))].filter(
      Boolean,
    );
    return candidates.find(c => !c.isDefeated) ?? candidates[0] ?? null;
  }

  /**
   * The members that act on this CombatantGroup's turn. The commander is always first.
   * @returns {TeriockCombatant[]}
   */
  get turnMembers() {
    const commander = this.system.commander;
    return [...this.members].sort((a, b) =>
      Number(b === commander) - Number(a === commander) || a.name.localeCompare(b.name)
    );
  }
}
