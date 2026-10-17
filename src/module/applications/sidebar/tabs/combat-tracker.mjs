import { icons } from "../../../constants/display/_module.mjs";
import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { createElement, makeIconClass } from "../../../utils/_module.mjs";

const { CombatTracker } = foundry.applications.sidebar.tabs;

/** @inheritDoc */
export default class TeriockCombatTracker extends CombatTracker {
  /**
   * Toggle whether a Combatant still has a reaction.
   * @param {PointerEvent} _event
   * @param {HTMLElement} target
   * @returns {Promise<void>}
   */
  static async #onToggleReaction(_event, target) {
    const combatant = this.viewed?.combatants.get(target.closest("[data-combatant-id]").dataset.combatantId);
    if (!combatant) { return; }
    const defaultCombatant = combatant?.system?.defaultCombatant ?? combatant;
    await defaultCombatant.update({ "system.reactions": defaultCombatant.system.reactions ? 0 : 1 });
  }

  /** @inheritDoc */
  static DEFAULT_OPTIONS = { actions: { toggleReaction: this.#onToggleReaction } };

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
  get viewed() {
    return super.viewed;
  }

  /** @inheritDoc */
  set viewed(combat) {
    const previous = this.viewed;
    super.viewed = combat;
    if (this.isPopout || previous === this.viewed) { return; }
    previous?.updateCombatantActors();
    this.viewed?.updateCombatantActors();
  }

  /** @inheritDoc */
  _onCombatantControl(event, target) {
    if (target.dataset.action === "rollInitiative") {
      this.defaultInitiativeExecutionData = ThresholdRoll.parseEvent(event);
    }
    return super._onCombatantControl(event, target);
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    for (const li of result.tracker?.querySelectorAll(".combatant") ?? []) {
      const combatant = this.viewed?.combatants.get(li.dataset.combatantId);
      if (!combatant || combatant.permission < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) { continue; }
      const hasReaction = Boolean(combatant.system.reactions);
      li.querySelector(".token-effects").before(
        createElement("button", {
          className: `inline-control combatant-control icon ${
            makeIconClass(icons.manifest.ui[hasReaction ? "on" : "off"], "button")
          }${hasReaction ? " active" : ""}`,
          dataset: { action: "toggleReaction", tooltip: "TERIOCK.SHEETS.Actor.SIDEBAR.ReactionBox.tooltip" },
          disabled: !combatant.isOwner,
          type: "button",
        }),
      );
    }
    super._replaceHTML(result, content, options);
  }
}
