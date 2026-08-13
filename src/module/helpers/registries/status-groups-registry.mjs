import BaseRegistryLifecycle from "./base-registry-lifecycle.mjs";

/**
 * @implements {Teriock.Registries.MultiRegistry<string, UUID<TeriockActor>, string>}
 */
export default class StatusGroupsRegistry extends BaseRegistryLifecycle {
  /**
   * Tracked status group members by group id.
   * @type {Map<string, Set<UUID<TeriockActor>>>}
   */
  #groups = new Map();

  /**
   * The actors associated with the group id.
   * @param {string} groupId
   * @return {UUID<TeriockActor>[]}
   */
  get(groupId) {
    return this.#groups.has(groupId) ? Array.from(this.#groups.get(groupId)) : [];
  }

  /**
   * Track an actor.
   * @param {string} groupId
   * @param {UUID<TeriockActor>} actorUuid
   */
  track(groupId, actorUuid) {
    if (!this.#groups.has(groupId)) { this.#groups.set(groupId, new Set()); }
    this.#groups.get(groupId).add(actorUuid);
  }

  /**
   * Untrack an actor.
   * @param {string} groupId
   * @param {UUID<TeriockActor>} actorUuid
   */
  untrack(groupId, actorUuid) {
    const set = this.#groups.get(groupId);
    if (!set) { return; }
    set.delete(actorUuid);
    if (!set.size) { this.#groups.delete(groupId); }
  }
}
