import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";

const { CombatTracker } = foundry.applications.sidebar.tabs;

/** @inheritDoc */
export default class TeriockCombatTracker extends CombatTracker {
  /** @type {Teriock.Command.ThresholdOptions} */
  #defaultInitiativeExecutionData;

  /**
   * Options for initiative rolls.
   * @returns {Teriock.Command.ThresholdOptions}
   */
  get defaultInitiativeExecutionData() {
    return this.#defaultInitiativeExecutionData ?? {};
  }

  set defaultInitiativeExecutionData(options) {
    this.#defaultInitiativeExecutionData = options;
  }

  /** @inheritDoc */
  _getEntryContextOptions() {
    const getCombatant = li => this.viewed.combatants.get(li.dataset.combatantId);
    return [{
      icon: "fa-solid fa-crown",
      label: "COMBATANT.ACTIONS.MakeCommander",
      onClick: (_event, li) => getCombatant(li)?.makeCommander(),
      visible: li => game.user.isGM && !getCombatant(li)?.isCommander,
    }, ...super._getEntryContextOptions()];
  }

  /** @inheritDoc */
  _onCombatantControl(event, target) {
    if (target.dataset.action === "rollInitiative") {
      this.defaultInitiativeExecutionData = ThresholdRoll.parseEvent(event);
    }
    return super._onCombatantControl(event, target);
  }
}
