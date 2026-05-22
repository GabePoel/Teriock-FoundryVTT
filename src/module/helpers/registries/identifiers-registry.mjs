import BaseRegistryLifecycle from "./abstract/base-registry-lifecycle.mjs";

/**
 * @typedef {TeriockActiveEffect|TeriockActor|TeriockItem|TeriockJournalEntryPage} IdentifiableDocument
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
   * Registration of document UUIDs. Keys are the identifier, and the value is a Map of UUIDs to their priority score.
   * @type {Map<TypedIdentifier, Map<UUID<IdentifiableDocument>, number>>}
   */
  #identifiers = new Map();

  /**
   * Hard-coded priorities for the system's built-in compendiums.
   * @type {Record<string, number>}
   */
  #packPriorities = {
    "teriock.abilities": 6,
    "teriock.bodyParts": 5,
    "teriock.classes": 4,
    "teriock.creatures": 2,
    "teriock.equipment": 5,
    "teriock.essentials": 1,
    "teriock.magicItems": 1,
    "teriock.properties": 6,
    "teriock.species": 3,
    "teriock.templateEffects": 1,
  };

  /**
   * The types of documents which can support children with indexed identifiers.
   * @type {Set<string>}
   */
  #parentDocumentNames = new Set(["JournalEntry"]);

  /**
   * Get a priority for a given UUID. Higher priority UUIDs are preferred over lower priority ones. If this returns null
   * then the provided UUID cannot be tracked.
   * @param {UUID<IdentifiableDocument>} uuid
   * @returns {number|null}
   */
  #getUuidPriority(uuid) {
    const parsed = foundry.utils.parseUuid(uuid);
    // Null value if the UUID is invalid or if the document is a valid type
    if (!parsed || !this.#documentNames.has(parsed.type)) return null;
    // Document must either be at the top level of a collection or the second level if it is an allowed embedded type
    const embeddable = parsed.embedded.length === 0
      || (parsed.embedded.length === 2 && this.#embeddedDocumentNames.has(parsed.type));
    if (!embeddable) return null;
    let level = 1;
    // Compendium collections are always prioritized over world collections
    if (parsed.collection?.collection?.startsWith("teriock.")) {
      const rootLevel = this.#packPriorities[parsed.collection.collection] ?? 0;
      level = rootLevel + 3;
    } else if (parsed.collection?.collection) {
      level = game.teriock.getSetting("prioritizeCustomIdentifiers") ? 10 : 2;
    }
    // IDs are used as tie breakers within a level
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
   * @param identifier
   * @param uuid
   */
  #track(identifier, uuid) {
    const priority = this.#getUuidPriority(uuid);
    if (priority === null) return;
    if (!this.#identifiers.has(identifier)) this.#identifiers.set(identifier, new Map());
    this.#identifiers.get(identifier).set(uuid, priority);
  }

  /**
   * @param {UUID<TeriockJournalEntry>} uuid
   * @returns {Promise<void>}
   */
  async #trackJournalEntry(uuid) {
    const journalEntry = await fromUuid(uuid);
    if (!journalEntry) return;
    for (const p of journalEntry.pages) {
      const typedIdentifier = p.typedIdentifier;
      if (typedIdentifier) this.#track(typedIdentifier, p.uuid);
    }
  }

  /** @inheritDoc */
  async activate() {
    await this.trackCompendiums();
    return super.activate();
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
    if (!this.active) return undefined;
    const group = this.#identifiers.get(identifier);
    if (!group || group.size === 0) return undefined;
    let highestPriority = -Infinity;
    let canonicalUuid = undefined;
    for (const [uuid, priority] of group.entries()) {
      if (priority > highestPriority) {
        highestPriority = priority;
        canonicalUuid = uuid;
      }
    }
    return canonicalUuid;
  }

  /**
   * Associate an identifer with a document UUID.
   * @param {TypedIdentifier} identifier
   * @param {UUID<IdentifiableDocument>} uuid
   */
  track(identifier, uuid) {
    this.#track(identifier, uuid);
  }

  /**
   * Track a compendium pack.
   * @param {CompendiumCollection} pack
   * @returns {Promise<void>}
   */
  async trackCompendium(pack) {
    if (this.#documentNames.has(pack.documentName) || this.#parentDocumentNames.has(pack.documentName)) {
      const index = await pack.getIndex({ fields: ["system.identifier", "system._sup"] });
      if (pack.documentName === "JournalEntry") {
        const promises = index.contents.map(d => this.#trackJournalEntry(d.uuid));
        await Promise.all(promises);
      } else {
        for (const d of index) {
          const type = d.type;
          const identifier = d.system?.identifier;
          const uuid = d.uuid;
          if (!type || !identifier || !uuid || d.system?._sup) continue;
          const typedIdentifier = `${type}:${identifier}`;
          this.#track(typedIdentifier, uuid);
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
    if (!this.#documentNames.has(document.documentName)) return;
    const uuid = document.uuid;
    const identifier = document.typedIdentifier;
    if (!uuid || !identifier || document.sup) return;
    this.track(identifier, uuid);
  }

  /**
   * Remove a UUID from the registry.
   * @param {TypedIdentifier} identifier
   * @param {UUID<IdentifiableDocument>} uuid
   */
  untrack(identifier, uuid) {
    const group = this.#identifiers.get(identifier);
    if (!group) return;
    group.delete(uuid);
    if (group.size === 0) this.#identifiers.delete(identifier);
  }

  /**
   * Untrack a document.
   * @param {IdentifiableDocument} document
   */
  untrackDocument(document) {
    if (!this.#documentNames.has(document.documentName)) return;
    const uuid = document.uuid;
    const identifier = document.typedIdentifier;
    if (!uuid || !identifier) return;
    this.untrack(identifier, uuid);
  }
}
