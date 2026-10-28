import { CombatExpiration } from "../../data/pseudo-documents/expirations/_module.mjs";
import { BaseExpiration } from "../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { InitiativeExecution } from "../../executions/activity-executions/_module.mjs";
import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Combat } = foundry.documents;

/**
 * Get the UUIDs of combatants and their default combatants.
 * @param {TeriockCombatant[]} combatants
 * @returns {UUID<TeriockCombatant>[]}
 */
function getResetUuids(combatants) {
  return [...new Set(combatants.flatMap(c => [c, c.system.defaultCombatant]).filter(c => c).map(c => c.uuid))];
}

/**
 * The Teriock Combat implementation.
 * @extends {Combat}
 * @mixes BaseDocument
 */
export default class TeriockCombat extends mixClasses(Combat, BaseDocumentMixin) {
  /**
   * Reset the given Combatants' actions, attack penalties, and reactions along with their default Combatants'.
   * @param {object} [options]
   * @param {TeriockCombatant[]} [options.actions] - Combatants whose actions reset.
   * @param {TeriockCombatant[]} [options.attackPenalties] - Combatants whose attack penalties reset.
   * @param {TeriockCombatant[]} [options.reactions] - Combatants whose reactions reset.
   */
  #changeTurn({ actions = [], attackPenalties = this.combatants.contents, reactions = [] } = {}) {
    game.users.queryGM("teriock.turnChange", {
      actionUuids: getResetUuids(actions),
      attackPenaltyUuids: getResetUuids(attackPenalties),
      reactionUuids: getResetUuids(reactions),
      sceneUuid: this.scene?.uuid ?? null,
    }, { failPrefix: "TERIOCK.SYSTEMS.Combat.QUERY.turnChange.failPrefix", localize: true });
  }

  /**
   * Keep the turn on the Combatant or CombatantGroups that had it before the turn order changed.
   * @param {{ id: ID<TeriockCombatant>, groupId: ID<TeriockCombatantGroup>|null }|null} prior
   */
  #keepTurn(prior) {
    if (!prior || !this.started || !game.user.isActiveGM) { return; }
    const turn = this.turns.findIndex(t => t.id === prior.id || (prior.groupId && t.group?.id === prior.groupId));
    if (turn >= 0 && turn !== this.turn) { this.update({ turn }, { turnEvents: false }); }
  }

  /**
   * Remove Combatants from their CombatantGroups and disband CombatantGroups without enough members.
   * @param {TeriockCombatant[]} combatants
   * @returns {{ deletes: ID<TeriockCombatantGroup>[], groupIds: Record<ID<TeriockCombatant>, ID|null> }}
   */
  #leaveChanges(combatants) {
    const deletes = [];
    const groupIds = Object.fromEntries(combatants.map(c => [c.id, null]));
    for (const group of new Set(combatants.map(c => c.group).filter(Boolean))) {
      const remaining = [...group.members].filter(m => !combatants.includes(m));
      if (remaining.length >= 2) { continue; }
      deletes.push(group.id);
      for (const member of remaining) { groupIds[member.id] = null; }
    }
    return { deletes, groupIds };
  }

  /**
   * Create CombatantGroups, move Combatants between CombatantGroups, and delete CombatantGroups in a single batch.
   * @param {object} changes
   * @param {object[]} [changes.create] - CombatantGroup data to create.
   * @param {ID<TeriockCombatantGroup>[]} [changes.deletes] - CombatantGroups to delete.
   * @param {Record<ID<TeriockCombatant>, ID|null>} [changes.groupIds] - New CombatantGroup of each Combatant.
   * @returns {Promise<void>}
   * @category Groups
   */
  async #modifyGroups({ create = [], deletes = [], groupIds = {} }) {
    const updates = Object.entries(groupIds).map(([_id, group]) => ({ _id, group }));
    await foundry.documents.modifyBatch(
      [
        create.length && { action: "create", data: create, documentName: "CombatantGroup", keepId: true, parent: this },
        updates.length && { action: "update", documentName: "Combatant", parent: this, updates },
        deletes.length && { action: "delete", documentName: "CombatantGroup", ids: deletes, parent: this },
      ].filter(Boolean),
    );
  }

  /**
   * Refresh turn order after modifying CombatantGroups.
   * @param {string} collection
   * @param {{ id: ID<TeriockCombatant>, groupId: ID<TeriockCombatantGroup>|null }|null} prior
   * @category Groups
   */
  #onModifyGroups(collection, prior) {
    if (collection === "groups") {
      this.setupTurns();
      if (this.isView) { ui.combat.render(); }
    }
    this._updateTurnMarkers();
    this.#keepTurn(prior);
  }

  /**
   * @param {TeriockActor|null} actor
   * @param {Teriock.Keys.CombatEvent} event
   * @param {Teriock.Keys.CombatTiming} timing
   */
  #refreshCombatExpirations(actor, event, timing) {
    BaseExpiration.massExpire(this.actors, CombatExpiration.metadata.type, { actor, event, timing });
  }

  /**
   * Hack to trigger token turn region events for skipped CombatantGroup members.
   * @param {string} eventName
   * @param {CombatTurnEventContext} context
   * @param {TeriockCombatant} combatant
   * @returns {Promise<void>}
   * @version 369
   * @category Groups
   */
  async #triggerMemberRegionEvents(eventName, context, combatant) {
    const promises = [];
    for (const member of combatant.turnMembers) {
      const token = member.token;
      if (member === combatant || !token) { continue; }
      for (const region of token.regions) {
        promises.push(region._triggerEvent(eventName, { combat: this, combatant: member, token, ...context }));
      }
    }
    await Promise.allSettled(promises);
  }

  /**
   * The current acting actor.
   * @returns {TeriockActor|null}
   */
  get actor() {
    return this.combatant?.actor ?? null;
  }

  /**
   * The actors in this combat.
   * @returns {TeriockActor[]}
   */
  get actors() {
    return [...new Set(this.combatants.map(c => c.actor).filter(Boolean))];
  }

  /** @inheritDoc */
  _onCreateDescendantDocuments(parent, collection, documents, data, options, userId) {
    const prior = this.combatant ? { groupId: this.combatant._source.group, id: this.combatant.id } : null;
    super._onCreateDescendantDocuments(parent, collection, documents, data, options, userId);
    // Expand newly created CombatantGroups in the tracker
    if (collection === "groups") {
      for (const app of [ui.combat, ui.combat.popout].filter(a => a?.rendered)) {
        for (const group of documents) { app._toggleCollapsed(`group-${group.id}`, false); }
      }
    }
    this.#onModifyGroups(collection, prior);
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    if (this.started && game.user.isActiveGM) { this._onEndCombat(); }
  }

  /** @inheritDoc */
  _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
    const prior = this.combatant ? { groupId: this.combatant._source.group, id: this.combatant.id } : null;
    if (collection === "combatants" && ids.includes(prior?.id) && this.groups.get(prior.groupId)?.members.size) {
      options.turnEvents = false;
    }
    super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);
    this.#onModifyGroups(collection, prior);
    if (collection === "combatants" && game.user.isActiveGM) {
      const { deletes, groupIds } = this.#leaveChanges(documents);
      for (const id of ids) { delete groupIds[id]; }
      if (deletes.length) { this.#modifyGroups({ deletes, groupIds }); }
    }
  }

  /**
   * A workflow that occurs at the end of combat.
   */
  _onEndCombat() {
    this.#refreshCombatExpirations(null, "combat", "end");
    this.#changeTurn({ attackPenalties: [] });
    for (const actor of this.actors) { actor.fireTrigger("combatEnd"); }
  }

  /** @inheritDoc */
  async _onEndRound(context) {
    await super._onEndRound(context);
    if (context.round > 0) { this.#refreshCombatExpirations(null, "round", "end"); }
  }

  /** @inheritDoc */
  async _onEndTurn(combatant, context) {
    await super._onEndTurn(combatant, context);
    for (const member of combatant.turnMembers) {
      this.#refreshCombatExpirations(member.actor, "turn", "end");
      member.actor?.fireTrigger("turnEnd");
    }
    await this.#triggerMemberRegionEvents(CONST.REGION_EVENTS.TOKEN_TURN_END, context, combatant);
  }

  /**
   * A workflow that occurs at the start of Combat.
   */
  _onStartCombat() {
    this.#refreshCombatExpirations(null, "combat", "start");
    for (const actor of this.actors) { actor.fireTrigger("combatStart"); }
  }

  /** @inheritDoc */
  async _onStartRound(context) {
    await super._onStartRound(context);
    if (context.round === 1 && !this.previous.round) { this._onStartCombat(); }
    this.#refreshCombatExpirations(null, "round", "start");
  }

  /** @inheritDoc */
  async _onStartTurn(combatant, context) {
    await super._onStartTurn(combatant, context);
    const members = combatant.turnMembers;
    const combatants = context.round === 1 && context.turn === 0 ? this.combatants.contents : members;
    this.#changeTurn({ actions: combatants, reactions: combatants });
    for (const member of members) {
      this.#refreshCombatExpirations(member.actor, "turn", "start");
      member.actor?.fireTrigger("turnStart");
      this.#refreshCombatExpirations(member.actor, "action", "start");
    }
    await this.#triggerMemberRegionEvents(CONST.REGION_EVENTS.TOKEN_TURN_START, context, combatant);
  }

  /** @inheritDoc */
  _onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId) {
    const prior = this.combatant ? { groupId: this.combatant._source.group, id: this.combatant.id } : null;
    super._onUpdateDescendantDocuments(parent, collection, documents, changes, options, userId);
    this.#onModifyGroups(collection, prior);
  }

  /**
   * @inheritDoc
   * @version 369
   */
  _sortCombatants(a, b) {
    const ia = Number.isNumeric(a.initiative) ? a.initiative : -Infinity;
    const ib = Number.isNumeric(b.initiative) ? b.initiative : -Infinity;
    return (ib - ia) || ((a.group?.id ?? a.id) > (b.group?.id ?? b.id) ? 1 : -1);
  }

  /** @inheritDoc */
  _updateTurnMarkers() {
    super._updateTurnMarkers();
    if (!canvas.ready || !this.isView) { return; }
    for (const member of this.combatant?.turnMembers ?? []) {
      member.token?.object?.renderFlags.set({ refreshTurnMarker: true });
    }
  }

  /**
   * Disband a CombatantGroup.
   * @param {TeriockCombatantGroup} group
   * @returns {Promise<void>}
   * @category Groups
   */
  async disbandGroup(group) {
    await this.#modifyGroups({
      deletes: [group.id],
      groupIds: Object.fromEntries([...group.members].map(m => [m.id, null])),
    });
  }

  /**
   * Add a Combatant or every member of a CombatantGroup to the target's CombatantGroup. If the target doesn't already
   * have a CombatantGroup, this will open a prompt to make one.
   * @param {TeriockCombatant|TeriockCombatantGroup} source
   * @param {TeriockCombatant|TeriockCombatantGroup} target
   * @param {object} [options]
   * @param {string} [options.name]
   * @param {CombatantGroupType} [options.type]
   * @param {Partial<ApplicationPosition>} [options.position] - Position of the creation dialog
   * @returns {Promise<void>}
   * @category Groups
   */
  async joinGroup(source, target, { name, position, type } = {}) {
    const group = target.documentName === "CombatantGroup" ? target : target.group;
    const joiners = source.documentName === "CombatantGroup" ? [...source.members] : [source];
    if (joiners.includes(target) || (group && joiners.every(c => c.group === group))) { return; }
    const create = [];
    let groupId = group?.id;
    if (!groupId) {
      const members = [target, ...joiners];
      if (!name || !type) {
        const nameContext = { commander: target, members };
        ({ name, type } =
          await CombatantGroup.implementation.createDialog({ name, type }, { parent: this }, {
            nameContext,
            ok: {
              callback: (_event, button) => {
                const data = new foundry.applications.ux.FormDataExtended(button.form).object;
                data.name = data.name?.trim();
                return data;
              },
            },
            position,
          }) ?? {});
        if (!type) { return; }
      }
      groupId = foundry.utils.randomID();
      create.push({
        _id: groupId,
        initiative: target.initiative,
        name,
        system: type === "commanded" ? { commanderId: target.id } : {},
        type,
      });
    }
    const { deletes, groupIds } = this.#leaveChanges(joiners);
    if (create.length) { groupIds[target.id] = groupId; }
    for (const joiner of joiners) { groupIds[joiner.id] = groupId; }
    await this.#modifyGroups({ create, deletes, groupIds });
  }

  /**
   * Remove a Combatant from its CombatantGroup.
   * @param {TeriockCombatant} combatant
   * @returns {Promise<void>}
   * @category Groups
   */
  async leaveGroup(combatant) {
    if (combatant.group) { await this.#modifyGroups(this.#leaveChanges([combatant])); }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const group of this.groups) { group.system.prepareDisplayData(); }
  }

  /**
   * @inheritDoc
   * @version 369
   */
  async resetAll({ updateTurn = true } = {}) {
    const currentId = this.combatant?.id;
    for (const g of this.groups) { g.updateSource({ initiative: null }); }
    for (const c of this.combatants) { c.updateSource({ initiative: null }); }
    this.reset();
    this.setupTurns();
    const update = { combatants: this.combatants.toObject(), groups: this.groups.toObject() };
    if (updateTurn && currentId) { update.turn = this.turns.findIndex(t => t.id === currentId); }
    await this.update(update, { diff: false, turnEvents: false });
    return this;
  }

  /** @inheritDoc */
  async rollAll(options = {}) {
    return super.rollAll(Object.assign(options, { noExecution: true }));
  }

  /** @inheritDoc */
  async rollInitiative(ids, options = {}) {
    // CombatantGroups are rolled for by only one Combatant. Otherwise, there would be dialog spam.
    const sources = new Map();
    for (const combatant of [ids].flat().map(id => this.combatants.get(id)).filter(Boolean)) {
      const key = combatant.group?.id ?? combatant.id;
      if (!sources.has(key)) { sources.set(key, combatant.group ?? combatant); }
    }
    let rollers = [...sources.values()].map(s => s.system.turnHolder ?? s);
    if (sources.size === 1 && !options.noExecution) {
      const execution = await InitiativeExecution.create({}, { source: [...sources.values()][0] });
      if (execution?.message?.rolls?.length) {
        rollers = [execution.roller];
        const total = execution.message.rolls[0]?.total;
        if (typeof total === "number") {
          options.formula = total.toString();
          options.messageOptions = execution.message.toObject();
          foundry.utils.setProperty(options, "messageOptions.flags.teriock.dontCreate", true);
        }
      } else { rollers = []; }
    }
    const out = await super.rollInitiative(rollers.map(c => c.id), options);
    await Promise.all(
      rollers.filter(c => c.group && c.isOwner).map(c =>
        c.group.update({ initiative: c._source.initiative }, { asGM: true })
      ),
    );
    return out;
  }

  /** @inheritDoc */
  async rollNPC(options = {}) {
    return super.rollNPC(Object.assign(options, { noExecution: true }));
  }

  /**
   * Make a Combatant the commander of its CombatantGroup.
   * @param {TeriockCombatant} combatant
   * @returns {Promise<void>}
   * @category Groups
   */
  async setCommander(combatant) {
    if (combatant.group?.type === "commanded") { await combatant.group.update({ "system.commanderId": combatant.id }); }
  }

  /** @inheritDoc */
  async setInitiative(id, value) {
    const group = this.combatants.get(id, { strict: true }).group;
    if (group) { await group.update({ initiative: value }, { asGM: true }); }
    else { await super.setInitiative(id, value); }
  }

  /**
   * @inheritDoc
   * @version 369
   * @category Groups
   */
  setupTurns() {
    this.turns ||= [];
    // Determine the turn order and the current turn
    // A CombatantGroup's `turnHolder` holds the space in turn order for all its members
    // Other Combatants in a CombatantGroup don't get their own turns
    const turns = this.combatants.contents.filter(c => !c.group || c === c.group.system.turnHolder).sort(
      this._sortCombatants,
    );
    if (this.turn !== null) {
      if (this.turn < 0) { this.turn = 0; }
      else if (this.turn >= turns.length) {
        this.turn = 0;
        this.round++;
      }
      turns.forEach((c, i) => {
        for (const member of c.turnMembers) { member.turnNumber = i; }
      });
    }
    // Update state tracking
    const c = turns[this.turn];
    this.current = this._getCurrentState(c);
    // One-time initialization of the previous state
    if (!this.previous) { this.previous = { ...this.current }; }
    // Return the array of prepared turns
    return this.turns = turns;
  }
}
