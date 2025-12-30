const { CombatTracker } = foundry.applications.sidebar.tabs;

export default class TeriockCombatTracker extends CombatTracker {
  /** @inheritDoc */
  _onCombatantControl(event, target) {
    /** @type {HTMLElement} */
    const combatantElement = target.closest("[data-combatant-id]");
    const { combatantId } = combatantElement?.dataset ?? {};
    const combatant = this.viewed?.combatants.get(combatantId);
    if (!combatant) return;
    if (target.dataset.action === "rollInitiative") {
      if (event.altKey && !event.shiftKey) {
        combatant._advantage = true;
      } else if (event.shiftKey && !event.altKey) {
        combatant._disadvantage = true;
      }
    }
    return super._onCombatantControl(event, target);
  }
}
