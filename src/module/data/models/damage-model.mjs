import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { formulaExists } from "../../helpers/formula.mjs";
import EvaluationModel from "./evaluation-model.mjs";

export default class DamageModel extends EvaluationModel {
  /** @inheritDoc */
  constructor(...args) {
    super(...args);
    this.typed = this.raw;
  }

  /** @type {string} */
  typed;

  /**
   * Add damage types to this model's roll formula.
   * @param {string[]} newTypes
   */
  addTypes(newTypes) {
    if (formulaExists(this.raw)) {
      const roll = new BaseRoll(this.raw);
      const terms = roll.terms.filter(
        (t) => !t.isDeterministic && !isNaN(Number(t.expression)),
      );
      terms.push(...roll.dice);
      terms.forEach((term) => {
        const types = term.flavor
          .toLowerCase()
          .split(" ")
          .map((type) => type.trim());
        types.push(...Array.from(newTypes));
        const reducedTypes = Array.from(new Set(types)).filter((t) => t);
        reducedTypes.sort((a, b) => a.localeCompare(b));
        term.options.flavor = reducedTypes.join(" ");
      });
      this.raw = roll.formula;
    }
    this.typed = this.raw;
  }
}
