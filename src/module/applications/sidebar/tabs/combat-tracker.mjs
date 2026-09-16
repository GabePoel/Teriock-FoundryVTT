import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { createElement } from "../../../helpers/html.mjs";
import { makeIconClass } from "../../../helpers/icon.mjs";

const { CombatTracker } = foundry.applications.sidebar.tabs;

/** @inheritDoc */
export default class TeriockCombatTracker extends CombatTracker {
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
        dropSelector: ".combatant[data-combatant-id",
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
        const operations = [{
          action: "update",
          documentName: combatant.documentName,
          pack: combatant.pack,
          parent: combatant.parent,
          updates: [{ _id: combatant.id, group: null }],
        }];
        if (combatant.isCommander && combatant.group.members.size > 1) {
          operations.push({
            action: "update",
            documentName: combatant.group.documentName,
            pack: combatant.group.pack,
            parent: combatant.group.parent,
            updates: [{ _id: combatant.group.id, "system.commander": null }],
          });
        } else if (combatant.group.members.size === 1) {
          operations.push({
            action: "delete",
            documentName: combatant.group.documentName,
            ids: [combatant.group.id],
            pack: combatant.group.pack,
            parent: combatant.group.parent,
          });
        }
        await foundry.documents.modifyBatch(operations);
      },
      visible: li => game.user.isGM && this.#getCombatant(li)?.group,
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
    if (targetCombatant?.documentName !== "Combatant" || draggedCombatant?.documentName !== "Combatant") { return; }
    if (!targetCombatant.group) { await targetCombatant.makeCommander(); }
    await draggedCombatant.update({ group: targetCombatant.group });
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    this._dragDrop.bind(this.element);
  }

  /** @inheritDoc */
  _replaceHTML(result, content, options) {
    super._replaceHTML(result, content, options);
    content.querySelectorAll(".combatant[data-combatant-id]").forEach(el => {
      const combatant = this.#getCombatant(el);
      const controls = el.querySelector(".token-name .combatant-controls");
      controls.insertAdjacentElement(
        "afterbegin",
        createElement("button", {
          className: `inline-control combatant-control icon ${makeIconClass(combatant.typeIcon, "solid")}`,
          dataset: { action: "changeGroupState", combatantId: combatant.id, groupId: combatant.group?.id ?? undefined },
        }),
      );
      const initiativeInput = el.querySelector("input.initiative-input");
      if (combatant.isMinion) { initiativeInput.setAttribute("disabled", "disabled"); }
    });
  }
}
