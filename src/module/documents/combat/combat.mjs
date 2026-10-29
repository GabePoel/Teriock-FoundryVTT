import DocumentSelector from "../../applications/dialogs/document-selector.mjs";
import { CombatExpiration } from "../../data/pseudo-documents/expirations/_module.mjs";
import { BaseExpiration } from "../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { InitiativeExecution } from "../../executions/activity-executions/_module.mjs";
import { batchWrite, mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Combat } = foundry.documents;

/**
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 */

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
   * Operations that create or delete Combatants and apply CombatantGroup changes.
   * @param {object} [changes]
   * @param {object[]} [changes.create] - CombatantGroup data to create.
   * @param {ID<TeriockCombatantGroup>[]} [changes.deletes] - CombatantGroups to delete.
   * @param {Record<ID<TeriockCombatant>, ID|null>} [changes.groupIds] - New CombatantGroup of each Combatant.
   * @param {object} [combatants]
   * @param {TeriockCombatant[]} [combatants.pending] - Combatants to create.
   * @param {TeriockCombatant[]} [combatants.removed] - Combatants to delete.
   * @returns {DatabaseWriteOperation[]}
   * @category Groups
   */
  #groupOperations({ create = [], deletes = [], groupIds = {} } = {}, { pending = [], removed = [] } = {}) {
    const pendingIds = new Set(pending.map(c => c.id));
    const updates = Object.entries(groupIds).filter(([id]) => !pendingIds.has(id)).map(([_id, group]) => ({
      _id,
      group,
    }));
    return [
      removed.length && {
        action: "delete",
        documentName: "Combatant",
        groupsUpdated: true,
        ids: removed.map(c => c.id),
        parent: this,
      },
      create.length && { action: "create", data: create, documentName: "CombatantGroup", keepId: true, parent: this },
      pending.length
      && {
        action: "create",
        data: pending.map(c => ({ ...c.toObject(), group: groupIds[c.id] ?? null })),
        documentName: "Combatant",
        keepId: true,
        parent: this,
        summonsGrouped: true,
      },
      updates.length && { action: "update", documentName: "Combatant", parent: this, updates },
      deletes.length && { action: "delete", documentName: "CombatantGroup", ids: deletes, parent: this },
    ].filter(Boolean);
  }

  /**
   * Group new summoned Combatants with their summoner and new summoners with their summoned Combatants.
   * @param {TeriockCombatant[]} combatants - Newly created Combatants.
   * @returns {Promise<void>}
   * @category Groups
   */
  async #groupSummons(combatants) {
    const changes = await this.#summonChanges(combatants);
    if (changes) { await batchWrite(this.#groupOperations(changes), { asGM: true }); }
  }

  /**
   * Changes that add Combatants to their targets' CombatantGroups. A target without a CombatantGroup gets a new one of
   * the given type with the target as its commander.
   * @param {{ joiners: TeriockCombatant[], name?: string, target: TeriockCombatant|TeriockCombatantGroup, type?: CombatantGroupType }[]} entries
   * @returns {{ create: object[], deletes: ID<TeriockCombatantGroup>[], groupIds: Record<ID<TeriockCombatant>, ID|null> }|null}
   * @category Groups
   */
  #joinChanges(entries) {
    const create = [];
    const joined = new Map();
    for (const { joiners, name, target, type } of entries) {
      if (joiners.includes(target)) { continue; }
      let groupId = target.documentName === "CombatantGroup" ? target.id : target.group?.id;
      const moving = joiners.filter(c => !groupId || c.group?.id !== groupId);
      if (!moving.length || (!groupId && !type)) { continue; }
      if (!groupId) {
        groupId = foundry.utils.randomID();
        create.push({ _id: groupId, initiative: target.initiative, name, system: { commanderId: target.id }, type });
        joined.set(target, groupId);
      }
      for (const joiner of moving) { joined.set(joiner, groupId); }
    }
    const movers = [...joined].filter(([c, groupId]) => c.group?.id !== groupId).map(([c]) => c);
    if (!movers.length) { return null; }
    const { deletes, groupIds } = this.#leaveChanges(movers);
    for (const mover of movers) { groupIds[mover.id] = joined.get(mover); }
    return { create, deletes, groupIds };
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
   * Changes that group summoned Combatants with their summoners where either is one of the given Combatants.
   * @param {TeriockCombatant[]} combatants - Combatants being added, which may not be created yet.
   * @returns {Promise<{ create: object[], deletes: ID<TeriockCombatantGroup>[], groupIds: Record<ID<TeriockCombatant>, ID|null> }|null>}
   * @category Groups
   */
  async #summonChanges(combatants) {
    const candidates = [...new Set([...this.combatants, ...combatants])];
    const byToken = new Map(candidates.filter(c => c.token).map(c => [c.token, c]));
    const addToGroup = t => Boolean(t.getFlag("teriock", "addToGroup"));
    const chains = new Map(
      candidates.map(c => [c, (c.token?.getAllSummons(addToGroup) ?? []).map(t => byToken.get(t)).filter(Boolean)]),
    );
    // Only the summoner at the top of a chain gathers a CombatantGroup
    const nested = new Set([...chains.values()].flat());
    const summons = new Map();
    for (const [root, chain] of chains) {
      if (nested.has(root) || ![root, ...chain].some(c => combatants.includes(c))) { continue; }
      const joiners = chain.filter(c => !root.group || c.group !== root.group);
      if (joiners.length) { summons.set(root, { joiners, type: chain[0].token.getFlag("teriock", "addToGroup") }); }
    }
    if (!summons.size) { return null; }
    if (game.settings.get("teriock", "confirmSummonsAddToGroup")) {
      // Select Tokens because the Combatants don't actually exist yet
      const tokens = [...summons.values()].flatMap(s => s.joiners.map(c => c.token));
      const selected = await DocumentSelector.selectMulti(tokens, {
        checked: tokens.map(t => t.uuid),
        hint: _loc("TERIOCK.DIALOGS.GroupSummons.hint"),
        textKey: "summoner.name",
        title: _loc("TERIOCK.DIALOGS.GroupSummons.title"),
      });
      if (!selected) { return null; }
      for (const s of summons.values()) { s.joiners = s.joiners.filter(c => selected.includes(c.token)); }
    }
    return this.#joinChanges([...summons].map(([target, { joiners, type }]) => ({ joiners, target, type })));
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
    if (collection === "combatants" && game.user.id === userId && game.users.activeGM && !options.summonsGrouped) {
      this.#groupSummons(documents);
    }
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
    if (collection === "combatants" && game.user.isActiveGM && !options.groupsUpdated) {
      const { deletes, groupIds } = this.#leaveChanges(documents);
      for (const id of ids) { delete groupIds[id]; }
      if (deletes.length) { batchWrite(this.#groupOperations({ deletes, groupIds })); }
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
   * Add Combatants and group summoned Combatants with their summoners in a single batch.
   * @param {object[]} data - Combatant data to create.
   * @returns {Promise<TeriockCombatant[]>}
   * @category Groups
   */
  async addCombatants(data) {
    const pending = data.map(d =>
      new Combatant.implementation({ ...d, _id: foundry.utils.randomID() }, { parent: this })
    );
    const changes = game.users.activeGM ? await this.#summonChanges(pending) : null;
    await batchWrite(this.#groupOperations(changes ?? {}, { pending }), { asGM: Boolean(changes) });
    return pending.map(c => this.combatants.get(c.id)).filter(Boolean);
  }

  /**
   * Disband a CombatantGroup.
   * @param {TeriockCombatantGroup} group
   * @returns {Promise<void>}
   * @category Groups
   */
  async disbandGroup(group) {
    await batchWrite(
      this.#groupOperations({
        deletes: [group.id],
        groupIds: Object.fromEntries([...group.members].map(m => [m.id, null])),
      }),
    );
  }

  /**
   * Add Combatants or every member of a CombatantGroup to the target's CombatantGroup. If the target doesn't already
   * have a CombatantGroup, one of the given type is made with the target as its commander.
   * @param {TeriockCombatant|TeriockCombatant[]|TeriockCombatantGroup} source
   * @param {TeriockCombatant|TeriockCombatantGroup} target
   * @param {object} [options]
   * @param {boolean} [options.asGM]
   * @param {string} [options.name]
   * @param {CombatantGroupType} [options.type]
   * @returns {Promise<void>}
   * @category Groups
   */
  async joinGroup(source, target, { asGM, name, type } = {}) {
    const joiners = source.documentName === "CombatantGroup" ? [...source.members] : [source].flat();
    const changes = this.#joinChanges([{ joiners, name, target, type }]);
    if (changes) { await batchWrite(this.#groupOperations(changes), { asGM }); }
  }

  /**
   * Add a Combatant or every member of a CombatantGroup to the target's CombatantGroup. If the target doesn't already
   * have a CombatantGroup, this will open a prompt to make one.
   * @param {TeriockCombatant|TeriockCombatantGroup} source
   * @param {TeriockCombatant|TeriockCombatantGroup} target
   * @param {object} [options]
   * @param {boolean} [options.asGM] - Have the GM make the changes.
   * @param {string} [options.name]
   * @param {Partial<ApplicationPosition>} [options.position]
   * @param {CombatantGroupType} [options.type]
   * @returns {Promise<void>}
   * @category Groups
   */
  async joinGroupDialog(source, target, { asGM, name, position, type } = {}) {
    const joiners = source.documentName === "CombatantGroup" ? [...source.members] : [source];
    const hasGroup = target.documentName === "CombatantGroup" || target.group;
    if (!hasGroup && !joiners.includes(target)) {
      const nameContext = { commander: target, members: [target, ...joiners] };
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
    }
    await this.joinGroup(source, target, { asGM, name, type });
  }

  /**
   * Remove a Combatant from its CombatantGroup.
   * @param {TeriockCombatant} combatant
   * @param {object} [options]
   * @param {boolean} [options.asGM] - Have the GM make the changes.
   * @returns {Promise<void>}
   * @category Groups
   */
  async leaveGroup(combatant, { asGM } = {}) {
    if (combatant.group) { await batchWrite(this.#groupOperations(this.#leaveChanges([combatant])), { asGM }); }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const group of this.groups) { group.system.prepareDisplayData(); }
  }

  /**
   * Remove Combatants and disband CombatantGroups left without enough members in a single batch.
   * @param {TeriockCombatant[]} combatants
   * @returns {Promise<TeriockCombatant[]>}
   * @category Groups
   */
  async removeCombatants(combatants) {
    // Without a GM, players can still remove Combatants but can't disband CombatantGroups
    const { deletes, groupIds } = game.users.activeGM ? this.#leaveChanges(combatants) : { deletes: [], groupIds: {} };
    for (const combatant of combatants) { delete groupIds[combatant.id]; }
    await batchWrite(this.#groupOperations({ deletes, groupIds }, { removed: combatants }), {
      asGM: deletes.length > 0,
    });
    return combatants;
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
    if (combatant.isMinion) { await combatant.group.update({ "system.commanderId": combatant.id }); }
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
