import TypeCollection from "./type-collection.mjs";

/**
 * A collection of subs for a sup that validate that all the subs are still correct.
 * @template K
 * @template V
 * @extends {TypeCollection<K, V>}
 * @see {HierarchyDocumentMixin}
 */
export default class SubCollection extends TypeCollection {
  /**
   * @param {Iterable<[ID<K>, V]>} [entries]
   * @param {ID<AnyCommonDocument>|null} [id] - The ID of the sup whose subs this collection holds.
   */
  constructor(entries, id = null) {
    super(entries);
    this.#id = id;
  }

  /** @type {ID<AnyCommonDocument>|null} */
  #id;

  /**
   * Whether a value still belongs to this collection's sup.
   * @param {V} value
   * @returns {boolean}
   */
  #validateValue(value) {
    return foundry.utils.getProperty(value, "system._sup") === this.#id;
  }

  /** @inheritDoc */
  get size() {
    let size = 0;
    for (const _value of this.values()) { size += 1; }
    return size;
  }

  /**
   * The ID of the sup whose subs this collection holds.
   * @returns {ID<AnyCommonDocument>|null}
   */
  get supId() {
    return this.#id;
  }

  /** @inheritDoc */
  *entries() {
    for (const [key, value] of super.entries()) {
      if (this.#validateValue(value)) { yield [key, value]; }
    }
  }

  /** @inheritDoc */
  get(key, options) {
    const value = super.get(key, options);
    if (value === undefined || this.#validateValue(value)) { return value; }
    if (options?.strict) {
      throw new Error(`The key ${key} does not exist in the ${this.constructor.name} Collection`);
    }
    return undefined;
  }

  /** @inheritDoc */
  has(key) {
    const value = super.get(key);
    return value !== undefined && this.#validateValue(value);
  }

  /** @inheritDoc */
  *keys() {
    for (const [key] of this.entries()) { yield key; }
  }

  /** @inheritDoc */
  *values() {
    for (const value of super.values()) {
      if (this.#validateValue(value)) { yield value; }
    }
  }
}
