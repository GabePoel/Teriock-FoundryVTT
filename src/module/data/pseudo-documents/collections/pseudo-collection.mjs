import { TypeCollection } from "../../../documents/collections/_module.mjs";

/**
 * Used for the specific task of containing embedded Pseudo-Document instances within a parent Document.
 * @template {{ type: string }} TPseudo
 * @extends {TypeCollection<TPseudo>}
 */
export default class PseudoCollection extends TypeCollection {
  /**
   * Active Pseudo-Documents.
   * @returns {TPseudo[]}
   */
  get active() {
    return this.contents.filter(p => this._checkIfActive(p));
  }

  /**
   * Check if a Pseudo-Document is active. This exists to be overridden when not in the parent collection.
   * @param {TPseudo} pseudo
   * @returns {boolean}
   */
  _checkIfActive(pseudo) {
    // Special handling for actor collection aliases. A less hacky way to do this might be to have a separate
    // `ActorPseudoCollection` class but then that would involve changing the data model (or removing it from there?)
    return (this.model?.document?.documentName === "Actor" ? pseudo?.document.active : true)
      && (pseudo?.active ?? true);
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
  getTypeSync(type, options = {}) {
    return (this.documentsByType[type] ?? []).filter(p => {
      if (typeof options.active === "boolean" && this._checkIfActive(p) !== options.active) { return false; }
      if (typeof options.crit === "boolean" && !p.crit?.has?.(Number(options.crit))) { return false; }
      if (typeof options.heighten === "boolean" && !p.heighten?.has?.(Number(options.heighten))) { return false; }
      if (typeof options.ongoing === "boolean" && !p.ongoing === options.ongoing) { return false; }
      return !(typeof options.competence === "number" && !p.competencies?.has?.(options.competence));
    });
  }
}
