import { toId } from "../../../utils/_module.mjs";
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
    if (pseudo?.disabledToggles instanceof Set) {
      const heightenToggle = this.model?.heightened ? "heightened" : "unheightened";
      if (typeof this.model?.heightened === "number" && pseudo.disabledToggles.has(heightenToggle)) { return false; }
      const level = TERIOCK.CONFIG.competence.levels[this.model?.competence?.value];
      if (level && pseudo.disabledToggles.has(level.toggle)) { return false; }
    }
    if (typeof pseudo?.checkIfQualified === "function") {
      return pseudo.checkIfQualified(() => this.model.getRollData());
    }
    return true;
  }

  /**
   * A new set of deterministically generated IDs are used because the contents of this may come from different
   * Collections. Otherwise, we technically have a risk of collisions.
   * @inheritDoc
   */
  _toEntry(document) {
    return [toId(document?.uuid ?? document?._id, { hash: true }), document];
  }
}
