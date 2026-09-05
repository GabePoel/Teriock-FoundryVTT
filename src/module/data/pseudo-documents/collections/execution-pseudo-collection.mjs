import PseudoCollection from "./pseudo-collection.mjs";

/**
 * An extension of Collection.
 * Used for the specific task of containing embedded Pseudo-Document instances used by an execution.
 * @template {{ type: string }} TPseudo
 * @extends {PseudoCollection<TPseudo>}
 */
export default class ExecutionPseudoCollection extends PseudoCollection {
  /** @inheritDoc */
  _checkIfActive(pseudo) {
    if (
      typeof this.model?.heightened === "number" && foundry.utils.getType(pseudo.heighten) === "Set"
      && !pseudo?.heighten?.has(Number(Boolean(this.model.heightened)))
    ) {
      return false;
    }
    if (
      typeof this.model?.competence?.value === "number" && foundry.utils.getType(pseudo.competencies) === "Set"
      && !pseudo?.competencies?.has(this.model.competence.value)
    ) { return false; }
    if (typeof pseudo?.checkIfQualified === "function") {
      return pseudo.checkIfQualified(() => this.model.getRollData());
    }
    return true;
  }
}
