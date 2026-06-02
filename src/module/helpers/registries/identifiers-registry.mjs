import { parseIdentifier } from "../utils.mjs";
import BaseRegistryLifecycle from "./abstract/base-registry-lifecycle.mjs";

/**
 * @typedef {TeriockActiveEffect|TeriockActor|TeriockItem|TeriockJournalEntryPage} IdentifiableDocument
 */

/**
 * @typedef {{ priority: number, name?: string }} TrackedUuid
 */

/**
 * Registry of document UUIDs based on their identifiers. Many documents could have the same identifier, but there is
 * only one canonical document for each identifier. Documents in Compendium packs are preferred over ones in the world
 * for establishing a single source of truth in regard to what identifiers refer to.
 * @implements {Teriock.Registries.SingleRegistry<TypedIdentifier, UUID<IdentifiableDocument>>}
 */
export default class IdentifiersRegistry extends BaseRegistryLifecycle {
  /**
   * The types of documents which support having identifiers.
   * @type {Set<string>}
   */
  #documentNames = new Set(["ActiveEffect", "Actor", "Item", "JournalEntryPage"]);

  /**
   * The types of documents which can be tracked even if they're embedded.
   * @type {Set<string>}
   */
  #embeddedDocumentNames = new Set(["JournalEntryPage"]);

  /**
   * Registration of document UUIDs keyed by type, then by untyped identifier. Values are Maps of UUIDs to their
   * priority score and name.
   * @type {Map<Teriock.Documents.CommonType|null, Map<Identifier, Map<UUID<IdentifiableDocument>, TrackedUuid>>>}
   */
  #identifiers = new Map();

  /**
   * The types of documents which can support children with indexed identifiers.
   * @type {Set<string>}
   */
  #parentDocumentNames = new Set(["JournalEntry"]);

  /**
   * Pick the highest-priority tracked UUID from a group.
   * @param {Map<UUID<IdentifiableDocument>, TrackedUuid>} group
   * @returns {{ uuid: UUID<IdentifiableDocument>, entry: TrackedUuid }|undefined}
   */
  #getCanonical(group) {
    let highestPriority = -Infinity;
    /** @type {{ uuid: UUID<IdentifiableDocument>, entry: TrackedUuid }|undefined} */
    let canonical = undefined;
    for (const [uuid, entry] of group.entries()) {
      if (entry.priority > highestPriority) {
        highestPriority = entry.priority;
        canonical = { entry, uuid };
      }
    }
    return canonical;
  }

  /**
   * Get a priority for a given UUID. Higher priority UUIDs are preferred over lower priority ones. If this returns null
   * then the provided UUID cannot be tracked.
   * @param {UUID<IdentifiableDocument>} uuid
   * @returns {number|null}
   */
  #getUuidPriority(uuid) {
    const parsed = foundry.utils.parseUuid(uuid);
    // Null value if the UUID is invalid or if the document is a valid type
    if (!parsed || !this.#documentNames.has(parsed.type)) { return null; }
    // Document must either be at the top level of a collection or the second level if it is an allowed embedded type
    const embeddable = parsed.embedded.length === 0
      || (parsed.embedded.length === 2 && this.#embeddedDocumentNames.has(parsed.type));
    if (!embeddable) { return null; }
    // By default, world collections are prioritized
    // This is a setting that can be changed
    let level = 0;
    if (parsed.collection?.collection) {
      const collection = parsed.collection.collection;
      const configuredPackPriorities = game.teriock.getSetting("identifierSourcePriority") ?? {};
      const configuredLevel = Number(configuredPackPriorities[collection]);
      if (Number.isFinite(configuredLevel)) { level = configuredLevel; }
    }
    // IDs are used as tiebreakers within a level
    const tieBreaker = this.#hashStringToInt(parsed.id);
    return level * 10_000_000_000 + tieBreaker;
  }

  /**
   * Deterministically convert a document's `_id` into an unsigned integer.
   * @param {string} str
   * @returns {number}
   */
  #hashStringToInt(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return hash >>> 0;
  }

  /**
   * Internally associate an identifier with a document UUID.
   * @param {TypedIdentifier} identifier
   * @param {UUID<IdentifiableDocument>} uuid
   * @param {string} [name]
   */
  #track(identifier, uuid, name) {
    const priority = this.#getUuidPriority(uuid);
    if (priority === null) { return; }
    const { identifier: id, type } = parseIdentifier(identifier);
    if (!this.#identifiers.has(type)) { this.#identifiers.set(type, new Map()); }
    const typeMap = this.#identifiers.get(type);
    if (!typeMap.has(id)) { typeMap.set(id, new Map()); }
    const group = typeMap.get(id);
    const existing = group.get(uuid);
    group.set(uuid, { name: name ?? existing?.name, priority });
  }

  /**
   * @param {UUID<TeriockJournalEntry>} uuid
   * @returns {Promise<void>}
   */
  async #trackJournalEntry(uuid) {
    const journalEntry = await fromUuid(uuid);
    if (!journalEntry) { return; }
    for (const p of journalEntry.pages) {
      const typedIdentifier = p?.typedIdentifier;
      if (typedIdentifier) { this.#track(typedIdentifier, p?.uuid, p?.name); }
    }
  }

  /**
   * The types of documents which support having identifiers.
   * @returns {Set<string>}
   */
  get documentNames() {
    return this.#documentNames;
  }

  /** @inheritDoc */
  _initialize() {
    this.trackCompendiums().then(() => super._initialize());
  }

  /**
   * Get a canonical document from its identifier.
   * @param {TypedIdentifier} identifier
   * @param {Teriock.System.GlobalFetchOptions} [options]
   * @returns {Promise<IdentifiableDocument|null>}
   */
  async fromIdentifier(identifier, options = {}) {
    return foundry.utils.fromUuid(this.get(identifier), options);
  }

  /**
   * Get a canonical document from its identifier synchronously.
   * @param {TypedIdentifier} identifier
   * @param {Teriock.System.SyncFetchOptions} [options]
   * @returns {IdentifiableDocument|null}
   */
  fromIdentifierSync(identifier, options = {}) {
    return foundry.utils.fromUuidSync(this.get(identifier), options);
  }

  /**
   * Get the UUID for the canonical document associated with an identifier.
   * @param {TypedIdentifier} identifier
   * @returns {UUID<IdentifiableDocument>|undefined}
   */
  get(identifier) {
    if (!this.initialized) { return undefined; }
    const { identifier: id, type } = parseIdentifier(identifier);
    const group = this.#identifiers.get(type)?.get(id);
    if (!group || group.size === 0) { return undefined; }
    return this.#getCanonical(group)?.uuid;
  }

  /**
   * Get the name of the canonical document associated with an identifier.
   * @param {TypedIdentifier} identifier
   * @param {object} [options]
   * @param {boolean} [options.forced] - Force a string to be provided. This will be either the provided identifier or
   * a blank string if the identifier is formatted incorrectly.
   * @returns {string|undefined}
   */
  getName(identifier, options = {}) {
    if (!this.initialized) { return undefined; }
    let out;
    const parsed = parseIdentifier(identifier);
    const { identifier: id, type } = parsed;
    const group = this.#identifiers.get(type)?.get(id);
    if (group && group.size) { out = this.#getCanonical(group)?.entry.name; }
    return options.forced ? (out || parsed.identifier || "") : out;
  }

  /**
   * Get the names of all identifiers of a given type. This is useful for displaying options in menus.
   * @param {string} type
   * @returns {Record<Identifier, string>}
   */
  getNames(type) {
    if (!this.initialized) { return {}; }
    const typeMap = this.#identifiers.get(type);
    if (!typeMap) { return {}; }
    return Object.fromEntries(
      [...typeMap.entries()].map(([id, group]) => {
        const name = this.#getCanonical(group)?.entry.name;
        return name ? [id, name] : null;
      }).filter(Boolean),
    );
  }

  /**
   * Get the UUIDs of all identifiers of a given type.
   * @param {string} type
   * @returns {Record<Identifier, UUID<TeriockDocument>>}
   */
  getUuids(type) {
    if (!this.initialized) { return {}; }
    const identifiers = this.#identifiers.get(type);
    if (!identifiers) { return {}; }
    return Object.fromEntries(identifiers.keys().map(k => [k, this.get(`${type}:${k}`)]));
  }

  /**
   * Associate an identifier with a document UUID.
   * @param {TypedIdentifier} identifier
   * @param {UUID<IdentifiableDocument>} uuid
   * @param {string} [name]
   */
  track(identifier, uuid, name) {
    this.#track(identifier, uuid, name);
  }

  /**
   * Track a compendium pack.
   * @param {CompendiumCollection} pack
   * @returns {Promise<void>}
   */
  async trackCompendium(pack) {
    if (this.#documentNames.has(pack.documentName) || this.#parentDocumentNames.has(pack.documentName)) {
      const index = await pack.getIndex({ fields: ["name", "system.identifier", "system._sup"] });
      if (pack.documentName === "JournalEntry") {
        const promises = index.contents.map(d => this.#trackJournalEntry(d.uuid));
        await Promise.all(promises);
      } else {
        for (const d of index) {
          const type = d.type;
          const identifier = d.system?.identifier;
          const uuid = d.uuid;
          if (!type || !identifier || !uuid || d.system?._sup) { continue; }
          const typedIdentifier = `${type}:${identifier}`;
          this.#track(typedIdentifier, uuid, d.name);
        }
      }
    }
  }

  /**
   * Track all the compendiums.
   * @returns {Promise<void>}
   */
  async trackCompendiums() {
    await Promise.all(game.packs.contents.map(p => this.trackCompendium(p)));
  }

  /**
   * Track a document.
   * @param {IdentifiableDocument} document
   */
  trackDocument(document) {
    if (!this.#documentNames.has(document.documentName)) { return; }
    const uuid = document.uuid;
    const identifier = document.typedIdentifier;
    if (!uuid || !identifier || document.sup) { return; }
    this.track(identifier, uuid, document.name);
  }

  /**
   * Remove a UUID from the registry.
   * @param {TypedIdentifier} identifier
   * @param {UUID<IdentifiableDocument>} uuid
   */
  untrack(identifier, uuid) {
    const { identifier: id, type } = parseIdentifier(identifier);
    const typeMap = this.#identifiers.get(type);
    if (!typeMap) { return; }
    const group = typeMap.get(id);
    if (!group) { return; }
    group.delete(uuid);
    if (group.size === 0) {
      typeMap.delete(id);
      if (typeMap.size === 0) { this.#identifiers.delete(type); }
    }
  }

  /**
   * Untrack a document.
   * @param {IdentifiableDocument} document
   */
  untrackDocument(document) {
    if (!this.#documentNames.has(document.documentName)) { return; }
    const uuid = document.uuid;
    const identifier = document.typedIdentifier;
    if (!uuid || !identifier) { return; }
    this.untrack(identifier, uuid);
  }
}
