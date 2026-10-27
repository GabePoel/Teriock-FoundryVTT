import { parseIdentifier } from "../utils/_module.mjs";

/**
 * @import { CompendiumCollection } from "@client/documents/collections/_module.mjs";
 * @import { DOCUMENT_OWNERSHIP_LEVELS } from "@common/constants.mjs";
 */

/**
 * @typedef {TeriockActiveEffect|TeriockActor|TeriockItem|TeriockJournalEntryPage} IdentifiableDocument
 */

/**
 * @typedef {{ img?: string, name?: string, pack?: string, priority: number, isType?: boolean }} TrackedUuid
 */

/**
 * @typedef IdentifierEntry
 * @property {UUID<IdentifiableDocument>} uuid
 * @property {boolean} isType
 * @property {string} [img]
 * @property {string} [name]
 */

/**
 * Item types that can be used as templates for other documents.
 * @type {Record<string, string>}
 */
const TYPE_FIELDS = { equipment: "equipmentType", mount: "mountType" };

/**
 * @typedef CanonicalLookupOptions
 * @property {number | keyof typeof DOCUMENT_OWNERSHIP_LEVELS} [permission] - Minimum required ownership level.
 */

/**
 * Registry of Document UUIDs based on their identifiers. Many Documents could have the same identifier, but there is
 * only one canonical Document for each identifier. Documents in Compendium packs are preferred over ones in the world
 * for establishing a single source of truth in regard to what identifiers refer to.
 * @implements {Teriock.Registries.SingleRegistry<TypedIdentifier, UUID<IdentifiableDocument>>}
 */
export default class IdentifiersRegistry {
  constructor() {
    this.#initializing = new Promise(resolve => {
      this.#resolveInitialization = resolve;
    });
  }

  /**
   * The types of Documents which can be tracked even if they're embedded.
   * @type {Set<Teriock.Documents.DocumentName>}
   */
  #embeddedDocumentNames = new Set(["JournalEntryPage"]);

  /**
   * Registration of Document UUIDs keyed by type, then by untyped identifier. Values are Maps of UUIDs to their
   * priority score and name.
   * @type {Map<Teriock.Documents.CommonType|null, Map<Identifier, Map<UUID<IdentifiableDocument>, TrackedUuid>>>}
   */
  #identifiers = new Map();

  /**
   * Whether this registry's initialization is complete.
   * @type {boolean}
   */
  #initialized = false;

  /** @type {Promise<void>} */
  #initializing;

  /**
   * The types of Documents which can support embedded Documents with indexed identifiers.
   * @type {Set<Teriock.Documents.DocumentName>}
   */
  #parentDocumentNames = new Set(["JournalEntry"]);

  /**
   * The types of Documents which support having identifiers.
   * @type {Set<Teriock.Documents.DocumentName>}
   */
  #primaryDocumentNames = new Set(["ActiveEffect", "Actor", "Item", "JournalEntryPage"]);

  /** @type {(value?: PromiseLike<void> | void) => void} */
  #resolveInitialization;

  /**
   * Registration of the Documents that define types, keyed by Item type.
   * @type {Map<string, Map<Identifier, IdentifierEntry>>}
   */
  #types = new Map(Object.keys(TYPE_FIELDS).map(t => [t, new Map()]));

  /**
   * Pick the highest-priority tracked UUID from a group.
   * @param {Map<UUID<IdentifiableDocument>, TrackedUuid>} group
   * @param {{ packLevels: Map<string, number>, permission: number|undefined }} [options]
   * @returns {{ uuid: UUID<IdentifiableDocument>, entry: TrackedUuid }|undefined}
   */
  #getCanonical(group, options = {}) {
    const { packLevels, permission } = options;
    let highestPriority = -Infinity;
    /** @type {{ uuid: UUID<IdentifiableDocument>, entry: TrackedUuid }|undefined} */
    let canonical = undefined;
    for (const [uuid, entry] of group.entries()) {
      if (entry.priority <= highestPriority) { continue; }
      if (permission !== undefined && this.#getLevel(uuid, entry, packLevels) < permission) { continue; }
      highestPriority = entry.priority;
      canonical = { entry, uuid };
    }
    return canonical;
  }

  /**
   * Get the ownership level the current user has over a tracked UUID.
   * @param {UUID<IdentifiableDocument>} uuid
   * @param {TrackedUuid} entry
   * @param {Map<string, number>} packLevels
   * @returns {number}
   */
  #getLevel(uuid, entry, packLevels) {
    // Documents in a compendium take their ownership from that pack rather than from themselves
    if (!entry.pack) {
      return foundry.utils.fromUuidSync(uuid)?.getUserLevel?.(game.user) ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE;
    }
    if (!packLevels.has(entry.pack)) {
      packLevels.set(entry.pack, game.packs.get(entry.pack)?.getUserLevel() ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE);
    }
    return packLevels.get(entry.pack);
  }

  /**
   * Get a priority for a given parsed UUID. Higher priority UUIDs are preferred over lower priority ones. If this
   * returns null then the provided UUID cannot be tracked.
   * @param {object} parsed
   * @returns {number|null}
   */
  #getUuidPriority(parsed) {
    // Null value if the UUID is invalid or if the Document is a valid type
    if (!parsed || !this.#primaryDocumentNames.has(parsed.type)) { return null; }
    // Document must either be at the top level of a collection or the second level if it is an allowed embedded type
    const embeddable = parsed.embedded.length === 0
      || (parsed.embedded.length === 2 && this.#embeddedDocumentNames.has(parsed.type));
    if (!embeddable) { return null; }
    // Compendium collections are prioritized
    let level = 0;
    if (parsed.collection?.collection) {
      const collection = parsed.collection.collection;
      const configuredPackPriorities = game.settings.get("teriock", "identifierSourcePriority") ?? {};
      const configuredLevel = Number(configuredPackPriorities[collection]);
      if (Number.isFinite(configuredLevel)) { level = configuredLevel; }
    }
    // IDs are used as tiebreakers within a level
    const tieBreaker = this.#hashStringToInt(parsed.id);
    return level * 10_000_000_000 + tieBreaker;
  }

  /**
   * Deterministically convert a Document's `_id` into an unsigned integer.
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
   * Refresh the cached type entry for an identifier.
   * @param {string} type
   * @param {Identifier} identifier
   */
  #refreshType(type, identifier) {
    const types = this.#types.get(type);
    if (!types) { return; }
    const group = this.#identifiers.get(type)?.get(identifier);
    const canonical = group && this.#getCanonical(group);
    if (canonical?.entry.isType) {
      const { img, name } = canonical.entry;
      types.set(identifier, { img, isType: true, name, uuid: canonical.uuid });
    } else {
      types.delete(identifier);
    }
  }

  /**
   * Prepare shared state for a series of canonical lookups.
   * @param {CanonicalLookupOptions} [options]
   * @returns {{ packLevels: Map<string, number>, permission: number|undefined }}
   */
  #resolveLookupOptions({ permission } = {}) {
    if (typeof permission === "string") {
      permission = CONST.DOCUMENT_OWNERSHIP_LEVELS[permission] ?? CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
    }
    return { packLevels: new Map(), permission };
  }

  /**
   * Internally associate an identifier with a Document UUID.
   * @param {TypedIdentifier} identifier
   * @param {UUID<IdentifiableDocument>} uuid
   * @param {{ img?: string, name?: string, isType?: boolean }} [data]
   */
  #track(identifier, uuid, data = {}) {
    const parsed = foundry.utils.parseUuid(uuid);
    const priority = this.#getUuidPriority(parsed);
    if (priority === null) { return; }
    const { identifier: id, type } = parseIdentifier(identifier);
    if (!this.#identifiers.has(type)) { this.#identifiers.set(type, new Map()); }
    const typeMap = this.#identifiers.get(type);
    if (!typeMap.has(id)) { typeMap.set(id, new Map()); }
    const group = typeMap.get(id);
    const existing = group.get(uuid);
    group.set(uuid, {
      img: data.img ?? existing?.img,
      isType: data.isType ?? existing?.isType ?? false,
      name: data.name ?? existing?.name,
      // World UUIDs parse to a collection so the prefix is what distinguishes a pack
      pack: uuid.startsWith("Compendium") ? parsed.collection?.collection : undefined,
      priority,
    });
    this.#refreshType(type, id);
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
      if (typedIdentifier) { this.#track(typedIdentifier, p?.uuid, { img: p?.img, name: p?.name }); }
    }
  }

  /**
   * The types of Documents which need to be tracked for having identifiers.
   * @return {Set<Teriock.Documents.DocumentName>}
   */
  get documentNames() {
    return new Set([...this.#primaryDocumentNames, ...this.#parentDocumentNames]);
  }

  /**
   * Canonical entries of all equipment types.
   * @returns {ReadonlyMap<Identifier, IdentifierEntry>}
   */
  get equipmentTypes() {
    return this.initialized ? this.#types.get("equipment") : new Map();
  }

  /**
   * Whether this registry's initialization is complete.
   */
  get initialized() {
    return this.#initialized;
  }

  /**
   * A promise that resolves when the registry is first initialized and ready.
   * @returns {Promise<void>}
   */
  get initializing() {
    return this.#initializing;
  }

  /**
   * Canonical entries of all mount types.
   * @returns {ReadonlyMap<Identifier, IdentifierEntry>}
   */
  get mountTypes() {
    return this.initialized ? this.#types.get("mount") : new Map();
  }

  /**
   * Populate the registry for the first time.
   */
  _initialize() {
    this.trackCompendiums().then(() => {
      if (!game._documentsReady || this.#initialized) { return; }
      this.#resolveInitialization();
      this.#initialized = true;
    });
  }

  /**
   * Get a canonical Document from its identifier.
   * @param {TypedIdentifier} identifier
   * @param {Teriock.System.GlobalFetchOptions} [options]
   * @returns {Promise<IdentifiableDocument|null>}
   */
  async fromIdentifier(identifier, options = {}) {
    return foundry.utils.fromUuid(this.get(identifier), options);
  }

  /**
   * Get a canonical Document from its identifier synchronously.
   * @param {TypedIdentifier} identifier
   * @param {Teriock.System.SyncFetchOptions} [options]
   * @returns {IdentifiableDocument|null}
   */
  fromIdentifierSync(identifier, options = {}) {
    return foundry.utils.fromUuidSync(this.get(identifier), options);
  }

  /**
   * Get the UUID for the canonical Document associated with an identifier.
   * @param {TypedIdentifier} identifier
   * @param {CanonicalLookupOptions} [options]
   * @returns {UUID<IdentifiableDocument>|undefined}
   */
  get(identifier, options = {}) {
    if (!this.initialized) { return undefined; }
    const { identifier: id, type } = parseIdentifier(identifier);
    const group = this.#identifiers.get(type)?.get(id);
    if (!group || group.size === 0) { return undefined; }
    return this.#getCanonical(group, this.#resolveLookupOptions(options))?.uuid;
  }

  /**
   * Get the entries of all identifiers of a given type. This is useful for displaying options in menus.
   * @param {string} type
   * @param {CanonicalLookupOptions} [options]
   * @returns {Record<Identifier, IdentifierEntry>}
   */
  getEntries(type, options = {}) {
    if (!this.initialized) { return {}; }
    const typeMap = this.#identifiers.get(type);
    if (!typeMap) { return {}; }
    const canonicalOptions = this.#resolveLookupOptions(options);
    const entries = {};
    for (const [identifier, group] of typeMap.entries()) {
      const canonical = this.#getCanonical(group, canonicalOptions);
      if (!canonical?.entry.name) { continue; }
      entries[identifier] = {
        img: canonical.entry.img,
        isType: canonical.entry.isType,
        name: canonical.entry.name,
        uuid: canonical.uuid,
      };
    }
    return entries;
  }

  /**
   * Get the image of the canonical Document associated with an identifier.
   * @param {TypedIdentifier} identifier
   * @param {CanonicalLookupOptions} [options]
   * @returns {string|undefined}
   */
  getImg(identifier, options = {}) {
    if (!this.initialized) { return undefined; }
    const { identifier: id, type } = parseIdentifier(identifier);
    const group = this.#identifiers.get(type)?.get(id);
    if (!group || group.size === 0) { return undefined; }
    return this.#getCanonical(group, this.#resolveLookupOptions(options))?.entry.img;
  }

  /**
   * Get the name of the canonical Document associated with an identifier.
   * @param {TypedIdentifier} identifier
   * @param {CanonicalLookupOptions} [options]
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
    if (group && group.size) { out = this.#getCanonical(group, this.#resolveLookupOptions(options))?.entry.name; }
    return options.forced ? (out || parsed.identifier || "") : out;
  }

  /**
   * Get the names of all identifiers of a given type. This is useful for displaying options in menus.
   * @param {string} type
   * @param {CanonicalLookupOptions} [options]
   * @returns {Record<Identifier, string>}
   */
  getNames(type, options = {}) {
    if (!this.initialized) { return {}; }
    const typeMap = this.#identifiers.get(type);
    if (!typeMap) { return {}; }
    const canonicalOptions = this.#resolveLookupOptions(options);
    const names = {};
    for (const [id, group] of typeMap.entries()) {
      const name = this.#getCanonical(group, canonicalOptions)?.entry.name;
      if (name) { names[id] = name; }
    }
    return names;
  }

  /**
   * Re-initialize the registry.
   */
  reset() {
    for (const types of this.#types.values()) { types.clear(); }
    this.#identifiers.clear();
    for (const documentName of this.documentNames) {
      for (const d of game.collections.get(documentName) ?? []) {
        this.trackDocument(d);
        for (const p of d.pages ?? []) { this.trackDocument(p); }
      }
    }
    this._initialize();
  }

  /**
   * Associate an identifier with a Document UUID.
   * @param {TypedIdentifier} identifier
   * @param {UUID<IdentifiableDocument>} uuid
   * @param {{ img?: string, name?: string, isType?: boolean }} [data]
   */
  track(identifier, uuid, data = {}) {
    this.#track(identifier, uuid, data);
  }

  /**
   * Track a compendium pack.
   * @param {CompendiumCollection} pack
   * @returns {Promise<void>}
   */
  async trackCompendium(pack) {
    if (this.documentNames.has(pack.documentName)) {
      const fields = ["name", "system.identifier", "system._sup"];
      if (pack.documentName === "Item") { fields.push(...Object.values(TYPE_FIELDS).map(f => `system.${f}`)); }
      const index = await pack.getIndex({ fields });
      if (pack.documentName === "JournalEntry") {
        const promises = index.contents.map(d => this.#trackJournalEntry(d.uuid));
        await Promise.all(promises);
      } else {
        for (const d of index) {
          const type = d.type;
          const identifier = d.system?.identifier;
          const uuid = d.uuid;
          if (!type || !identifier || !uuid || d.system?._sup) { continue; }
          const isType = Boolean(TYPE_FIELDS[type]) && d.system?.[TYPE_FIELDS[type]] === identifier;
          const typedIdentifier = `${type}:${identifier}`;
          this.#track(typedIdentifier, uuid, { img: d.img, isType, name: d.name });
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
   * Track a Document.
   * @param {IdentifiableDocument} document
   */
  trackDocument(document) {
    if (!this.#primaryDocumentNames.has(document.documentName)) { return; }
    const uuid = document.uuid;
    const identifier = document.typedIdentifier;
    if (!uuid || !identifier || document.sup || !document.trackable) { return; }
    const field = TYPE_FIELDS[document.type];
    const isType = Boolean(field) && document.system?.[field] === identifier;
    this.track(identifier, uuid, { img: document.img, isType, name: document.name });
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
    this.#refreshType(type, id);
  }

  /**
   * Untrack a Document.
   * @param {IdentifiableDocument} document
   */
  untrackDocument(document) {
    if (!this.#primaryDocumentNames.has(document.documentName)) { return; }
    const uuid = document.uuid;
    const identifier = document.typedIdentifier;
    if (!uuid || !identifier) { return; }
    this.untrack(identifier, uuid);
  }
}
