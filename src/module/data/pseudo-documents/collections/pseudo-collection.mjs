const { Collection } = foundry.utils;

/**
 * @import { EmbeddedCollection } from "@common/abstract/_module.mjs";
 */

/**
 * An extension of Collection corresponding to {@link EmbeddedCollection}.
 * Used for the specific task of containing embedded Pseudo-Document instances within a parent Document.
 * @template {{ type: string }} TPseudo
 * @extends {Collection<ID<TPseudo>, TPseudo>}
 */
export default class PseudoCollection extends Collection {
  /**
   * @param {Iterable<[ID<TPseudo>, TPseudo]>} entries
   * @param {object} [options]
   * @param {TPseudo['type'][]} [options.types]
   */
  constructor(entries, options = {}) {
    super(entries);
    this.#types = options.types ?? [];
  }

  /**
   * A cache of this collection's contents grouped by subtype.
   * @type {{ [K in TPseudo['type']]?: Extract<TPseudo, { type: K }>[] } | null}
   */
  #documentsByType = null;

  /** @type {TPseudo['type'][]} */
  #types = [];

  /**
   * Active Pseudo-Documents.
   * @returns {TPseudo[]}
   */
  get active() {
    return this.contents.filter(p => this._checkIfActive(p));
  }

  /**
   * This collection's contents grouped by subtype.
   * @returns {{ [K in TPseudo['type']]: Extract<TPseudo, { type: K }>[] }}
   */
  get documentsByType() {
    if (!this.#documentsByType) {
      const documentTypeMap = Object.fromEntries(this.#types.map(t => [t, []]));
      this.contents.forEach(d => {
        if (!documentTypeMap[d.type]) { documentTypeMap[d.type] = []; }
        documentTypeMap[d.type].push(d);
      });
      this.#documentsByType = documentTypeMap;
    }
    return this.#documentsByType;
  }

  /**
   * Check if a Pseudo-Document is active. This exists to be overridden when not in the parent collection.
   * @param {TPseudo} pseudo
   * @returns {boolean}
   */
  _checkIfActive(pseudo) {
    return pseudo?.active ?? true;
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

  /**
   * Get all Pseudo-Documents of a given type matching criteria.
   * @template {TPseudo['type']} T
   * @param {T} type
   * @param {object} [options]
   * @param {boolean} [options.active]
   * @param {boolean} [options.crit]
   * @param {boolean} [options.heighten]
   * @param {boolean} [options.ongoing]
   * @param {Teriock.System.CompetenceLevel} [options.competence]
   * @returns {Extract<TPseudo, { type: T }>[]}
   */
  getType(type, options = {}) {
    return (this.documentsByType[type] ?? []).filter(p => {
      if (typeof options.active === "boolean" && this._checkIfActive(p) !== options.active) { return false; }
      if (typeof options.crit === "boolean" && !p.crit?.has?.(Number(options.crit))) { return false; }
      if (typeof options.heighten === "boolean" && !p.heighten?.has?.(Number(options.heighten))) { return false; }
      if (typeof options.ongoing === "boolean" && !p.ongoing === options.ongoing) { return false; }
      return !(typeof options.competence === "number" && !p.competencies?.has?.(options.competence));
    });
  }

  /** @inheritDoc */
  set(key, value) {
    if (#documentsByType in this) { this.#documentsByType = null; }
    return super.set(key, value);
  }
}
