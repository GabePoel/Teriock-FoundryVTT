import { getSystemClass } from "../../utils/_module.mjs";

const { Collection } = foundry.utils;

/**
 * @import { DataModel, EmbeddedCollection } from "@common/abstract/_module.mjs";
 */

/**
 * An extension of Collection corresponding to {@link EmbeddedCollection} with some extra bells and whistles that make
 * it useful for managing Documents that don't technically live in the location where the Collection is defined.
 * @template {{ type: string, _id: ID<TDocument> }} TDocument
 * @extends {Collection<ID<TDocument>, TDocument>}
 */
export default class TypeCollection extends Collection {
  /**
   * Metadata for this collection.
   * @type {Teriock.Metadata.CollectionMetadata}
   */
  static metadata = Object.freeze({ validate: false });

  /**
   * @param {string} name
   * @param {DataModel} parent
   * @param {object[]} [sourceArray]
   * @param {object} [options]
   * @param {string[]} [options.types]
   * @param {typeof DataModel} [options.documentClass]
   */
  constructor(name, parent, sourceArray = [], options = {}) {
    super();
    this.addDocuments(sourceArray);
    Object.defineProperties(this, {
      documentClass: { configurable: true, value: options.documentClass ?? parent?.constructor, writable: false },
      model: { configurable: false, value: parent, writable: true },
      name: { configurable: false, value: name, writable: false },
      types: {
        configurable: false,
        value: options.types ?? options.documentClass?.TYPES ?? parent?.constructor?.TYPES ?? [],
        writable: false,
      },
    });
  }

  #documentsByTag = null;

  #documentsByType = null;

  /**
   * Group this collection's contents by subtype without validation.
   * @returns {Record<TDocument["type"], TDocument[]>}
   */
  #groupByType() {
    if (!this.#documentsByType) {
      const documentTypeMap = Object.fromEntries(this.types.map((t) => [t, []]));
      this.forEach((d) => {
        if (!documentTypeMap[d?.type]) { documentTypeMap[d?.type] = []; }
        documentTypeMap[d?.type].push(d);
      });
      this.#documentsByType = documentTypeMap;
    }
    return this.#documentsByType;
  }

  /**
   * @template T
   * @param {T[]} documents
   * @returns {Promise<T[]>}
   */
  async #resolveDocuments(documents) {
    const results = await Promise.all(
      documents.map(d => (d instanceof foundry.abstract.DataModel ? d : fromUuid(d?.uuid))),
    );
    return results.filter(Boolean);
  }

  /**
   * Wrap grouped contents so each group is validated when accessed.
   * @param {Record<string, TDocument[]>} groups
   * @returns {Record<string, TDocument[]>}
   */
  #validateGroups(groups) {
    if (!this.metadata.validate) { return groups; }
    const out = {};
    for (const key of Object.keys(groups)) {
      Object.defineProperty(out, key, {
        configurable: true,
        enumerable: true,
        get: () => groups[key].filter((d) => this._validateDocument(d)),
      });
    }
    return out;
  }

  /**
   * The Document implementation used by instantiated entries within this collection.
   * @type {typeof TDocument}
   */
  documentClass;

  /**
   * The parent Document to which this ChildCollection instance belongs.
   * @type {DataModel}
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
   * @type {TDocument["type"][]}
   */
  types = [];

  /**
   * This collection's contents grouped by metadata tag.
   * @returns {Record<string, TDocument[]>}
   */
  get documentsByTag() {
    if (!this.#documentsByTag) {
      const documentsByType = this.#groupByType();
      const documentTagMap = {};
      for (const type of this.types) {
        for (const [tag, value] of Object.entries(this._getTypeModel(type)?.metadata.tags ?? {})) {
          documentTagMap[tag] ??= [];
          if (value) { documentTagMap[tag].push(...(documentsByType[type] ?? [])); }
        }
      }
      this.#documentsByTag = documentTagMap;
    }
    return this.#validateGroups(this.#documentsByTag);
  }

  /**
   * This collection's contents grouped by subtype.
   * @returns {{ [K in TDocument["type"]]: Extract<TDocument, { type: K }>[] }}
   */
  get documentsByType() {
    return this.#validateGroups(this.#groupByType());
  }

  /**
   * All the identifiers in this collection.
   * @returns {Set<TypedIdentifier>}
   * @todo Add caching.
   */
  get identifiers() {
    return new Set(Object.keys(this.getNames()));
  }

  /**
   * Metadata for this collection.
   * @returns {Teriock.Metadata.CollectionMetadata}
   */
  get metadata() {
    return this.constructor.metadata;
  }

  /** @inheritDoc */
  get size() {
    if (!this.metadata.validate) { return super.size; }
    let size = 0;
    for (const _value of this.values()) { size += 1; }
    return size;
  }

  /**
   * The data model for a type in this collection.
   * @param {TDocument["type"]} type
   * @returns {typeof DataModel|null}
   */
  _getTypeModel(type) {
    return getSystemClass(type);
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
  clear() {
    this.#documentsByTag = null;
    this.#documentsByType = null;
    return super.clear();
  }

  /** @inheritDoc */
  delete(key) {
    this.#documentsByTag = null;
    this.#documentsByType = null;
    return super.delete(key);
  }

  /** @inheritDoc */
  *entries() {
    const validate = this.metadata.validate;
    for (const [key, value] of super.entries()) {
      if (!validate || this._validateDocument(value)) { yield [key, value]; }
    }
  }

  /** @inheritDoc */
  get(key, options) {
    const value = super.get(key, options);
    if (!this.metadata.validate) { return value; }
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
   * Names of the identifiers in this collection. This is useful for displaying options in menus.
   * @param {object} [options]
   * @param {(document: TDocument) => boolean} [options.filter] - Only include documents that pass this filter.
   * @returns {Record<TypedIdentifier, string>}
   */
  getNames({ filter } = {}) {
    const names = {};
    for (const d of this.contents) {
      if (filter && !filter(d)) { continue; }
      const identifier = foundry.utils.getProperty(d, "system.identifier");
      if (d?.type && identifier) { names[`${d.type}:${identifier}`] = d.name; }
    }
    return names;
  }

  /**
   * Asynchronously fetch all Documents of a given type.
   * @template {TDocument["type"]} T
   * @param {T} type
   * @returns {Promise<Extract<TDocument, { type: T }>[]>}
   */
  async getType(type) {
    return this.#resolveDocuments(this.getTypeSync(type));
  }

  /**
   * Synchronously get all Documents of a given type.
   * @template {TDocument["type"]} T
   * @param {T} type
   * @returns {Extract<TDocument, { type: T }>[]}
   */
  getTypeSync(type) {
    return this.documentsByType[type] ?? [];
  }

  /** @inheritDoc */
  has(key) {
    if (!this.metadata.validate) { return super.has(key); }
    const value = super.get(key);
    return value !== undefined && this._validateDocument(value);
  }

  /** @inheritDoc */
  *keys() {
    if (!this.metadata.validate) {
      yield* super.keys();
      return;
    }
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
    this.#documentsByTag = null;
    this.#documentsByType = null;
    return super.set(key, value);
  }

  /** @inheritDoc */
  *values() {
    const validate = this.metadata.validate;
    for (const value of super.values()) {
      if (!validate || this._validateDocument(value)) { yield value; }
    }
  }
}
