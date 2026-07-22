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
  _onCombatantControl(event, target) {
    if (target.dataset.action === "rollInitiative") {
      this.defaultInitiativeExecutionData = ThresholdRoll.parseEvent(event);
    }
    return super._onCombatantControl(event, target);
  }
}
