const { Collection } = foundry.utils;

/**
 * @import { EmbeddedCollection } from "@common/abstract/_module.mjs";
 */

/**
 * An extension of Collection corresponding to {@link EmbeddedCollection} with some extra bells and whistles that make
 * it useful for managing Documents that don't technically live in the location where the Collection is defined.
 * @template {{ type: string, _id: ID<TDocument> }} TDocument
 * @extends {Collection<ID<TDocument>, TDocument>}
 */
export default class TypeCollection extends Collection {
  constructor(name, parent, sourceArray = [], options = {}) {
    super();
    this.addDocuments(sourceArray);
    Object.defineProperties(this, {
      documentClass: { configurable: true, value: options.documentClass ?? parent?.constructor, writable: false },
      model: { configurable: false, value: parent, writable: false },
      name: { configurable: false, value: name, writable: false },
      types: {
        configurable: false,
        value: options.types ?? options.documentClass?.TYPES ?? parent?.constructor?.TYPES ?? [],
        writable: false,
      },
    });
  }

  #documentsByType = null;

  /**
   * @template T
   * @param {T[]} documents
   * @param {object} [options]
   * @param {boolean} [options.validate=true]
   * @returns {Promise<T[]>}
   */
  async #resolveDocuments(documents, options = {}) {
    const results = await Promise.all(
      documents.filter(d => !options.validate || this._validateDocument(d)).map(d => fromUuid(d?.uuid)),
    );
    return results.filter(Boolean);
  }

  /**
   * The Document implementation used by instantiated entries within this collection.
   * @type {typeof TDocument}
   */
  documentClass;

  /**
   * The parent Document to which this ChildCollection instance belongs.
   * @type {TeriockDocument}
   */
  model;

  /**
   * The name of this collection in the parent Document.
   * @type {string}
   * @todo Maybe remove this or make it optional since it's really only used for one error message.
   */
  name;

  /**
   * The types of documents in this collection.
   * @type {TDocument['type'][]}
   */
  types = [];

  /**
   * This collection's contents grouped by subtype.
   * @returns {{ [K in TDocument['type']]: Extract<TDocument, { type: K }>[] }}
   */
  get documentsByType() {
    if (!this.#documentsByType) {
      const documentTypeMap = Object.fromEntries(this.types.map((t) => [t, []]));
      this.contents.forEach((d) => {
        if (!documentTypeMap[d?.type]) { documentTypeMap[d?.type] = []; }
        documentTypeMap[d?.type].push(d);
      });
      this.#documentsByType = documentTypeMap;
    }
    const out = {};
    for (const type of Object.keys(this.#documentsByType)) {
      Object.defineProperty(out, type, {
        configurable: true,
        enumerable: true,
        get: () => (this.#documentsByType[type] ?? []).filter((d) => this._validateDocument(d)),
      });
    }
    return out;
  }

  /**
   * All the identifiers in this collection.
   * @returns {Set<TypedIdentifier>}
   * @todo Add caching.
   */
  get identifiers() {
    return new Set(
      this.contents.filter(d => d?.type && foundry.utils.getProperty(d, "system.identifier")).map(d =>
        `${d?.type}:${d?.system?.identifier}`
      ),
    );
  }

  /** @inheritDoc */
  get size() {
    let size = 0;
    for (const _value of this.values()) { size += 1; }
    return size;
  }

  /**
   * @param {TDocument} document
   * @returns {[string, TDocument][]}
   */
  _toEntry(document) {
    return [document._id, document];
  }

  /**
   * Validate a document.
   * @param {TDocument} _document
   * @returns {boolean}
   */
  _validateDocument(_document) {
    return true;
  }

  /**
   * Add many Documents to this.
   * @param {TDocument[]} documents
   */
  addDocuments(documents) {
    for (const d of documents) {
      const entry = this._toEntry(d);
      this.set(entry[0], entry[1]);
    }
  }

  /** @inheritDoc */
  clear(key, value) {
    if (#documentsByType in this) { this.#documentsByType = null; }
    return super.clear(key, value);
  }

  /** @inheritDoc */
  delete(key, value) {
    if (#documentsByType in this) { this.#documentsByType = null; }
    return super.delete(key, value);
  }

  /** @inheritDoc */
  *entries() {
    for (const [key, value] of super.entries()) { if (this._validateDocument(value)) { yield [key, value]; } }
  }

  /** @inheritDoc */
  get(key, options) {
    const value = super.get(key, options);
    if (value === undefined || this._validateDocument(value)) { return value; }
    if (options?.strict) {
      throw new Error(`The key ${key} does not exist in the ${this.constructor.name} Collection`);
    }
    return undefined;
  }

  /**
   * Asynchronously get the contents.
   * @returns {Promise<TDocument[]>}
   */
  async getContents() {
    return this.#resolveDocuments(this.contents);
  }

  /**
   * Asynchronously fetch a document.
   * @param {string} key
   * @returns {Promise<TDocument|null>}
   */
  async getDocument(key) {
    return foundry.utils.fromUuid(this.get(key)?.uuid);
  }

  /**
   * Asynchronously fetch all Documents of a given type.
   * @template {TDocument['type']} T
   * @param {T} type
   * @returns {Promise<Extract<TDocument, { type: T }>[]>}
   */
  async getType(type) {
    return this.#resolveDocuments(this.getTypeSync(type), { validate: false });
  }

  /**
   * Synchronously get all Documents of a given type.
   * @template {TDocument['type']} T
   * @param {T} type
   * @returns {Extract<TDocument, { type: T }>[]}
   */
  getTypeSync(type) {
    return this.documentsByType[type] ?? [];
  }

  /** @inheritDoc */
  has(key) {
    const value = super.get(key);
    return value !== undefined && this._validateDocument(value);
  }

  /** @inheritDoc */
  *keys() {
    for (const [key] of this.entries()) { yield key; }
  }

  /**
   * Render sheets for all ApplicationV2s of Documents in this Collection.
   * @param {boolean} [force=false]
   * @param {object} [options={}]
   */
  renderSheets(force = false, options = {}) {
    this.getContents().then(contents => {
      for (const document of contents) {
        if (typeof document?.apps === "object") {
          for (const app of Object.values(document.apps)) {
            if (app instanceof foundry.applications.api.ApplicationV2) {
              app.render({ ...options, force });
            }
          }
        }
      }
    });
  }

  /**
   * Reset with the given Documents.
   * @param {TDocument[]} documents
   */
  resetDocuments(documents) {
    this.clear();
    this.addDocuments(documents);
  }

  /** @inheritDoc */
  set(key, value) {
    if (#documentsByType in this) { this.#documentsByType = null; }
    return super.set(key, value);
  }

  /** @inheritDoc */
  *values() {
    for (const value of super.values()) {
      if (this._validateDocument(value)) { yield value; }
    }
  }
}
