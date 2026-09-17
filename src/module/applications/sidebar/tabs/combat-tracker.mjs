import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { createElement } from "../../../helpers/html.mjs";
import { makeIconClass, makeIconElement } from "../../../helpers/icon.mjs";
import { BaseApplicationMixin } from "../../api/mixins/_module.mjs";

const { CombatTracker } = foundry.applications.sidebar.tabs;

/** @inheritDoc */
export default class TeriockCombatTracker extends BaseApplicationMixin(CombatTracker) {
  /** @type {Teriock.Command.ThresholdOptions} */
  #defaultInitiativeExecutionData;

  /** @type {DragDrop} */
  #dragDrop = null;

  /**
   * Get the combatant from an element.
   * @param {HTMLLIElement} li
   * @returns {TeriockCombatant}
   */
  #getCombatant(li) {
    return this.viewed.combatants.get(li.dataset.combatantId);
  }

  /**
   * Return a cached copy of a DragDrop instance.
   * @returns {DragDrop}
   */
  get _dragDrop() {
    return this.#dragDrop
      ?? new foundry.applications.ux.DragDrop.implementation({
        callbacks: { dragstart: this._onDragStart.bind(this), drop: this._onDrop.bind(this) },
        dragSelector: ".combatant[data-combatant-id]",
        dropSelector: ".combatant[data-combatant-id]",
      });
  }

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
    return [{
      icon: makeIconClass(TERIOCK.display.icons.manifest.combat.commander, "contextMenu"),
      label: "COMBATANT.ACTIONS.MakeCommander",
      onClick: (_event, li) => this.#getCombatant(li)?.makeCommander(),
      visible: li => game.user.isGM && !this.#getCombatant(li)?.isCommander,
    }, {
      icon: makeIconClass(TERIOCK.display.icons.manifest.combat.combatant, "contextMenu"),
      label: "COMBATANT.ACTIONS.LeaveGroup",
      onClick: async (_vent, li) => {
        const combatant = this.#getCombatant(li);
        if (!combatant) { return; }
        await combatant.leaveGroup();
      },
      visible: li => game.user.isGM && this.#getCombatant(li)?.groupDocument,
    }, ...super._getEntryContextOptions()];
  }

  /** @inheritDoc */
  _onCombatantControl(event, target) {
    if (target.dataset.action === "rollInitiative") {
      this.defaultInitiativeExecutionData = ThresholdRoll.parseEvent(event);
    }
    return super._onCombatantControl(event, target);
  }

  /**
   * Handle dragging a combatant.
   * @param {DragEvent} event
   */
  _onDragStart(event) {
    const combatant = this.#getCombatant(event.currentTarget);
    if (combatant) { event.dataTransfer.setData("text/plain", JSON.stringify(combatant.toDragData())); }
  }

  /**
   * Handle dropping a combatant onto another combatant.
   * @param {DragEvent} event
   * @returns {Promise<void>}
   */
  async _onDrop(event) {
    const targetCombatant = this.#getCombatant(event.target?.closest(".combatant[data-combatant-id]"));
    const draggedCombatant = fromUuidSync(foundry.applications.ux.TextEditor.getDragEventData(event)?.uuid);
    if (draggedCombatant?.documentName !== "Combatant") { return; }
    if (targetCombatant?.documentName !== "Combatant") { await draggedCombatant.leaveGroup(); }
    else { await draggedCombatant.joinGroup(targetCombatant); }
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this._dragDrop.bind(this.element);
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    const tracker = result.tracker;
    tracker.querySelectorAll("li.combatant[data-combatant-id]").forEach(/** @param {HTMLLIElement} li */ li => {
      const combatant = this.#getCombatant(li);
      const groupContainer = createElement("li", {
        className: "combatant-group collapsible",
        dataset: { collapsibleId: `group-${combatant.id}`, groupId: combatant.groupDocument?.id },
      });
      groupContainer.style.setProperty("--group-color", combatant.system.color.css);
      const groupHeader = createElement("header", { className: "combatant-group-header" });
      const groupCommanderContainer = createElement("ul", { className: "combatant-group-commander" });
      groupHeader.append(groupCommanderContainer);
      groupContainer.append(groupHeader);
      li.replaceWith(groupContainer);
      groupCommanderContainer.append(li);
      const minionsContainer = createElement("div", { className: "combatant-group-minions-container" });
      minionsContainer.append(
        createElement("ul", { className: "combatant-group-minions", dataset: { combatantId: combatant.id } }),
      );
      groupContainer.append(minionsContainer);
      if (combatant.isCommander) {
        const groupExpander = createElement("div", {
          className: "combatant-group-expander",
          dataset: { action: "toggleCollapse" },
        });
        groupExpander.append(makeIconElement(TERIOCK.display.icons.manifest.ui.menuOpen, "light"));
        groupContainer.append(groupExpander);
      }
    });
    tracker.querySelectorAll("li.combatant[data-combatant-id]").forEach(/** @param {HTMLLIElement} li */ li => {
      const combatant = this.#getCombatant(li);
      li.querySelector(".token-name .name")?.prepend(makeIconElement(combatant.typeIcon, "solid"));
      if (combatant.groupDocument?.system.commander && !combatant.isCommander) {
        const groupContainer = li.closest(".combatant-group");
        groupContainer?.remove();
        const commander = combatant.groupDocument.system.commander;
        const minionContainer = tracker.querySelector(`.combatant-group-minions[data-combatant-id="${commander?.id}"]`);
        minionContainer.append(li);
      }
    });
    super._replaceHTML(result, content, options);
  }
}
