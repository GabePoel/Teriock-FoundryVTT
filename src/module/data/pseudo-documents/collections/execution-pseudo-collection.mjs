import PseudoCollection from "./pseudo-collection.mjs";

/**
 * An extension of Collection.
 * Used for the specific task of containing embedded Pseudo-Document instances used by an execution.
 * @template {{ type: string }} TPseudo
 * @extends {PseudoCollection<TPseudo>}
 */
export default class ExecutionPseudoCollection extends PseudoCollection {
  /**
   * @param {Iterable<[ID<TPseudo>, TPseudo]>} entries
   * @param {BaseExecution} execution
   * @param {object} [options]
   * @param {TPseudo['type'][]} [options.types]
   */
  constructor(entries, execution, options = {}) {
    super(entries, options);
    this.#execution = execution;
  }

  /** @type {BaseExecution} */
  #execution;

  /** @inheritDoc */
  _checkIfActive(pseudo) {
    if (
      typeof this.#execution?.heightened === "boolean" && foundry.utils.getType(pseudo.heighten) === "Set"
      && !pseudo?.heighten?.has(Number(this.#execution.heightened))
    ) {
      return false;
    }
    if (
      typeof this.#execution?.competence?.value === "number" && foundry.utils.getType(pseudo.competencies) === "Set"
      && !pseudo?.competencies?.has(this.#execution.competence.value)
    ) { return false; }
    if (typeof pseudo?.checkIfQualified === "function") {
      return pseudo.checkIfQualified(() => this.#execution.getRollData());
    }
    return true;
  }
}
