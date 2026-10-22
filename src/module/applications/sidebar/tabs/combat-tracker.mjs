import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { makeIconClass, mixClasses } from "../../../utils/_module.mjs";
import { BaseApplicationMixin, DragDropApplicationMixin } from "../../api/mixins/_module.mjs";

const { CombatTracker } = foundry.applications.sidebar.tabs;

/**
 * @extends {CombatTracker}
 * @mixes BaseApplication
 * @mixes DragDropApplication
 */
export default class TeriockCombatTracker
  extends mixClasses(CombatTracker, BaseApplicationMixin, DragDropApplicationMixin)
{
  /**
   * Toggle whether a CombatantGroup's members are shown.
   * @param {MouseEvent} event
   * @param {HTMLElement} target
   */
  static #onToggleGroup(event, target) {
    if (event.target.closest("button, .token-initiative")) { return; }
    this._toggleCollapsed(this._getCollapsibleId(target), undefined, target);
  }

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
    await defaultCombatant.update({
      "system.reactions": defaultCombatant.system.reactions ? 0 : TERIOCK.CONFIG.combat.maxReactions,
    });
  }

  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    actions: { toggleReaction: this.#onToggleReaction },
    doubles: { toggleGroup: this.#onToggleGroup },
    teriock: {
      doubleClickDelay: 0,
      dragDrop: {
        selectors: { drag: ".combatant[data-combatant-id], .combatant-group-header", drop: ".combat-tracker" },
      },
    },
  };

  /** @inheritDoc */
  static PARTS = { ...super.PARTS, tracker: { ...super.PARTS.tracker, template: "teriock/sidebar/combat-tracker" } };

  /**
   * Make the core target keybinding target every member of a hovered CombatantGroup.
   */
  static registerGroupTargeting() {
    const action = game.keybindings.actions.get("core.target");
    const { onDown } = action;
    action.onDown = context =>
      [ui.combat, ui.combat.popout].some(app => app?.targetHoveredGroup(!context.isShift)) || onDown(context);
    game.keybindings.initialize();
  }

  /** @type {UUID<TeriockCombatant|TeriockCombatantGroup>|null} */
  #draggedUuid = null;

  /** @type {TeriockToken[]} */
  #highlightedGroup = [];

  /**
   * Mark the tracker entry that a dragged Combatant or CombatantGroup would join.
   * @param {HTMLElement|null} entry
   */
  #markDropTarget(entry) {
    for (const el of this.element.querySelectorAll(".combat-tracker > .drop-target")) {
      if (el !== entry) { el.classList.remove("drop-target"); }
    }
    entry?.classList.add("drop-target");
  }

  /**
   * Pan to the tokens and zoom out enough to see all of them.
   * @param {TeriockToken[]} tokens
   * @returns {Promise<boolean>}
   */
  #panToTokens(tokens) {
    const padding = canvas.grid.size;
    const left = Math.min(...tokens.map(t => t.bounds.left)) - padding;
    const right = Math.max(...tokens.map(t => t.bounds.right)) + padding;
    const top = Math.min(...tokens.map(t => t.bounds.top)) - padding;
    const bottom = Math.max(...tokens.map(t => t.bounds.bottom)) + padding;
    const [width, height] = canvas.screenDimensions;
    return canvas.animatePan({
      scale: Math.min(canvas.stage.scale.x, width / (right - left), height / (bottom - top)),
      x: (left + right) / 2,
      y: (top + bottom) / 2,
    });
  }

  /**
   * Options for initiative rolls.
   * @type {Teriock.Command.ThresholdOptions}
   */
  defaultInitiativeExecutionData = {};

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
  _canDragDrop() {
    return game.user.isGM;
  }

  /** @inheritDoc */
  _canDragStart(_selector) {
    return game.user.isGM;
  }

  /** @inheritDoc */
  _dropEffect(_event) {
    return this.#draggedUuid ? "copy" : "none";
  }

  /** @inheritDoc */
  _getEntryContextOptions() {
    const getCombatant = li => this.viewed?.combatants.get(li.dataset.combatantId);
    const options = super._getEntryContextOptions();
    // Clearing initiative has to go through combat to clear group initiative
    const clear = options.find(o => o.label === "COMBATANT.ACTIONS.Clear");
    if (clear) { clear.onClick = (_event, li) => this.viewed?.setInitiative(li.dataset.combatantId, null); }
    return [{
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.combat.commander, "contextMenu"),
      label: "TERIOCK.COMBAT.Group.ACTIONS.makeCommander",
      onClick: (_event, li) => this.viewed?.setCommander(getCombatant(li)),
      visible: li => {
        const combatant = getCombatant(li);
        return game.user.isGM && combatant?.group?.type === "commanded" && !combatant.isCommander;
      },
    }, {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.combat.leaveGroup, "contextMenu"),
      label: "TERIOCK.COMBAT.Group.ACTIONS.leaveGroup",
      onClick: (_event, li) => this.viewed?.leaveGroup(getCombatant(li)),
      visible: li => game.user.isGM && Boolean(getCombatant(li)?.group),
    }, {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.combat.disbandGroup, "contextMenu"),
      label: "TERIOCK.COMBAT.Group.ACTIONS.disbandGroup",
      onClick: (_event, li) => this.viewed?.disbandGroup(getCombatant(li).group),
      visible: li => game.user.isGM && Boolean(getCombatant(li)?.group),
    }, ...options];
  }

  /**
   * Get context menu entries for CombatantGroups in the tracker.
   * @returns {ContextMenuEntry[]}
   */
  _getGroupContextOptions() {
    const getGroup = li => this.viewed?.groups.get(li.closest("[data-group-id]")?.dataset.groupId);
    return [{
      icon: "fa-solid fa-edit",
      label: "TERIOCK.COMBAT.Group.ACTIONS.update",
      onClick: (_event, li) =>
        getGroup(li)?.sheet.render({
          force: true,
          position: { left: window.innerWidth - 720, top: Math.min(li.offsetTop, window.innerHeight - 350) },
        }),
      visible: () => game.user.isGM,
    }, {
      icon: "fa-solid fa-arrow-rotate-left",
      label: "COMBATANT.ACTIONS.Clear",
      onClick: (_event, li) => getGroup(li)?.update({ initiative: null }, { asGM: true }),
      visible: li => game.user.isGM && Number.isFinite(getGroup(li)?.initiative),
    }, {
      icon: "fa-solid fa-dice-d20",
      label: "COMBATANT.ACTIONS.Reroll",
      onClick: (_event, li) => {
        const holder = getGroup(li)?.turnHolder;
        if (holder) { return this.viewed.rollInitiative([holder.id]); }
      },
      visible: () => game.user.isGM,
    }, {
      icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.combat.disbandGroup, "contextMenu"),
      label: "TERIOCK.COMBAT.Group.ACTIONS.disbandGroup",
      onClick: (_event, li) => {
        const group = getGroup(li);
        if (group) { return this.viewed.disbandGroup(group); }
      },
      visible: () => game.user.isGM,
    }];
  }

  /** @inheritDoc */
  _onCombatantControl(event, target) {
    if (target.dataset.action === "rollInitiative") {
      this.defaultInitiativeExecutionData = ThresholdRoll.parseEvent(event);
    }
    const group = target.closest(".combatant-group-row")
      ? this.viewed?.groups.get(target.closest("[data-group-id]").dataset.groupId)
      : null;
    if (!group) { return super._onCombatantControl(event, target); }
    // CombatantGroup controls apply to all their members
    const members = [...group.members];
    switch (target.dataset.action) {
      case "panToCombatant": {
        if (!canvas.ready) { return; }
        const tokens = members.filter(m => m.visible).map(m => m.token?.object).filter(token =>
          token && this._isTokenVisible(token)
        );
        if (!tokens.length) { return ui.notifications.warn("COMBATANT.WarnNonVisibleToken", { localize: true }); }
        return this.#panToTokens(tokens);
      }
      case "toggleDefeated": {
        const defeated = !group.turnHolder.isDefeated;
        return Promise.all([
          this.viewed.updateEmbeddedDocuments("Combatant", members.map(m => ({ _id: m.id, defeated }))),
          ...members.map(m =>
            m.actor?.toggleStatusEffect(CONFIG.specialStatusEffects.DEFEATED, { active: defeated, overlay: true })
          ),
        ]);
      }
      case "toggleHidden":
        return this.viewed.updateEmbeddedDocuments(
          "Combatant",
          members.map(m => ({ _id: m.id, hidden: !group.hidden })),
        );
      default:
        return super._onCombatantControl(event, target);
    }
  }

  /** @inheritDoc */
  _onCombatantHoverIn(event) {
    const row = event.target.closest(".combatant-group-row");
    if (!row) { return super._onCombatantHoverIn(event); }
    if (!canvas.ready) { return; }
    // CombatantGroups highlight all members' tokens
    const group = this.viewed?.groups.get(row.closest("[data-group-id]").dataset.groupId);
    this.#highlightedGroup = [...(group?.members ?? [])].filter(m => m.visible).map(m => m.token?.object).filter(
      token => token?._canHover(game.user, event) && this._isTokenVisible(token)
    );
    this.#highlightedGroup.forEach((token, i) => token._onHoverIn(event, { hoverOutOthers: i === 0 }));
  }

  /** @inheritDoc */
  _onCombatantHoverOut(event) {
    super._onCombatantHoverOut(event);
    for (const token of this.#highlightedGroup) { token._onHoverOut(event); }
    this.#highlightedGroup = [];
  }

  /** @inheritDoc */
  _onCombatantMouseDown(event, target) {
    if (event.type === "dblclick" || event.target.closest("input, button")) {
      return super._onCombatantMouseDown(event, target);
    }
    // CombatantGroups select all their members' tokens
    const combatants = target?.classList.contains("combatant-group-row")
      ? this.viewed?.groups.get(target.closest("[data-group-id]").dataset.groupId)?.members
      : [this.viewed?.combatants.get(target?.dataset.combatantId)];
    const controlled = [];
    for (const token of [...(combatants ?? [])].map(c => c?.token?.object).filter(Boolean)) {
      if (token.control({ releaseOthers: !event.shiftKey && !controlled.length })) { controlled.push(token); }
    }
    if (controlled.length) { this.#panToTokens(controlled); }
  }

  /** @inheritDoc */
  async _onDragEnd(event) {
    await super._onDragEnd(event);
    this.#draggedUuid = null;
    this.#markDropTarget(null);
  }

  /** @inheritDoc */
  async _onDragLeaveApplication(event) {
    await super._onDragLeaveApplication(event);
    this.#markDropTarget(null);
  }

  /** @inheritDoc */
  async _onDragOver(event) {
    await super._onDragOver(event);
    const entry = event.target.closest(".combat-tracker > *");
    const dragged = `[data-uuid="${this.#draggedUuid}"]`;
    const isOwnEntry = entry?.matches(dragged) || entry?.querySelector(dragged);
    this.#markDropTarget(this.#draggedUuid && !isOwnEntry ? entry : null);
  }

  /** @inheritDoc */
  _onDragStart(event) {
    super._onDragStart(event);
    this.#draggedUuid = event.currentTarget.dataset.uuid;
  }

  /** @inheritDoc */
  async _onDrop(event) {
    await super._onDrop(event);
    this.#markDropTarget(null);
    const combat = this.viewed;
    const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
    const source = ["Combatant", "CombatantGroup"].includes(data.type) ? await fromUuid(data.uuid) : null;
    if (!combat || source?.parent !== combat) { return; }
    const target = combat.combatants.get(event.target.closest("[data-combatant-id]")?.dataset.combatantId)
      ?? combat.groups.get(event.target.closest("[data-group-id]")?.dataset.groupId);
    if (!target) { return source.documentName === "Combatant" ? combat.leaveGroup(source) : undefined; }
    const { left, top } = event.target.closest(".combat-tracker > *").getBoundingClientRect();
    await combat.joinGroup(source, target, { position: { left: left - 330, top, width: 320 } });
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    this._createContextMenu(this._getGroupContextOptions, ".combatant-group-row", {
      fixed: true,
      hookName: "getCombatantGroupContextOptions",
      parentClassHooks: false,
    });
  }

  /**
   * @inheritDoc
   * @version 369
   */
  _onUpdateInitiative(event) {
    const combat = this.viewed;
    const group = combat?.combatants.get(event.target.closest("[data-combatant-id]")?.dataset.combatantId)?.group
      ?? combat?.groups.get(event.target.closest("[data-group-id]")?.dataset.groupId);
    if (!group) { return super._onUpdateInitiative(event); }
    const raw = event.target.value;
    let initiative = raw ? Number(raw.replace(/^=/, "")) : null;
    if (/^[+-]/.test(raw)) {
      const delta = parseInt(raw);
      if (isNaN(delta)) { return; }
      initiative = group.initiative + delta;
    }
    return group.update({ initiative }, { asGM: true });
  }

  /** @inheritDoc */
  async _prepareCombatContext(context, options) {
    await super._prepareCombatContext(context, options);
    // Players can change the turn as long as they own any turn member
    const combat = this.viewed;
    if (context.control || !combat?.combatant?.group) { return; }
    const isPlayerTurn = combat.combatant.turnMembers.some(m => m.players.includes(game.user));
    const canControl = combat.turn && combat.turn.between(1, combat.turns.length - 2)
      ? combat.canUserModify(game.user, "update", { turn: 0 })
      : combat.canUserModify(game.user, "update", { round: 0 });
    context.control = isPlayerTurn && canControl;
  }

  /**
   * @inheritDoc
   * @version 369
   */
  async _prepareTrackerContext(context, _options) {
    const combat = this.viewed;
    if (!combat) { return; }
    const turns = context.turns = [];
    const rows = [];
    for (const [i, holder] of combat.turns.entries()) {
      const group = holder.group;
      const members = [];
      for (const member of holder.turnMembers) {
        if (member.visible) { members.push(await this._prepareTurnContext(combat, member, i)); }
      }
      rows.push(...members);
      if (!group) {
        turns.push(...members);
        continue;
      }
      if (!members.length) { continue; }
      // Commanders always roll for their CombatantGroups
      const roller = group.system.commander ?? [...group.members].find(m => m.isOwner);
      const rollerId = roller?.isOwner ? roller.id : null;
      // Players see a CombatantGroup with only one visible member as a standalone Combatant
      if (members.length === 1 && !game.user.isGM) {
        turns.push(Object.assign(members[0], { icon: null, locked: false, rollerId }));
        continue;
      }
      const face = group.face;
      // A CombatantGroup is only defeated once its turn holder is
      const defeated = holder.isDefeated;
      turns.push({
        css: [i === combat.turn ? "active" : null, group.hidden ? "hide" : null, defeated ? "defeated" : null]
          .filterJoin(" "),
        group: {
          color: face.token?.color,
          defeated,
          hidden: group.hidden,
          icon: { css: makeIconClass(group.system.metadata.icon, "text"), tooltip: group.typeLabel },
          id: group.id,
          img: group.img || face.img,
          initiative: group.initiative,
          name: group.name || face.name,
          rollerId,
          uuid: group.uuid,
        },
        members,
      });
      rows.push(turns.at(-1).group);
    }
    const hasDecimals = rows.some(t => Number.isFinite(t.initiative) && !Number.isInteger(t.initiative));
    const precision = CONFIG.Combat.initiative.decimals;
    for (const t of rows) {
      if (Number.isFinite(t.initiative)) { t.initiative = t.initiative.toFixed(hasDecimals ? precision : 0); }
    }
    context.hasDecimals = hasDecimals;
  }

  /** @inheritDoc */
  async _prepareTurnContext(combat, combatant, index) {
    const turn = await super._prepareTurnContext(combat, combatant, index);
    const hasReaction = Boolean(combatant.system.reactions);
    const tagIcon = combatant.isCommander ? combatant.system.tagIcon : null;
    // CombatantGroup initiative is handled by the group header
    const locked = Boolean(combatant.group);
    return Object.assign(turn, {
      color: combatant.token?.color,
      icon: tagIcon ? { css: makeIconClass(tagIcon.icon, "text"), tooltip: tagIcon.tooltip } : null,
      locked,
      reaction: combatant.permission >= CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER
        ? {
          css: `${makeIconClass(TERIOCK.DISPLAY.icons.manifest.ui[hasReaction ? "on" : "off"], "button")}${
            hasReaction ? " active" : ""
          }`,
          disabled: !combatant.isOwner,
        }
        : null,
      rollerId: combatant.isOwner && !locked ? combatant.id : null,
      uuid: combatant.uuid,
    });
  }

  /**
   * Toggle targeting the tokens of the hovered CombatantGroup.
   * @param {boolean} releaseOthers
   * @returns {boolean} Whether there was a hovered CombatantGroup to target.
   */
  targetHoveredGroup(releaseOthers) {
    const tokens = this.#highlightedGroup;
    if (!tokens.length || !canvas.tokens?.active) { return false; }
    const mode = tokens.every(t => t.isTargeted) ? "release" : releaseOthers ? "replace" : "acquire";
    canvas.tokens.setTargets(tokens.map(t => t.id), { mode });
    return true;
  }
}
