import { RollRollableTakeHandler } from "../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import FormulaField from "../../fields/formula-field.mjs";
import BaseAutomation from "./base-automation.mjs";
import { LabelAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Parameters.Consequence.RollConsequenceKey} roll
 * @property {string} formula
 * @property {boolean} merge
 */
export default class RollAutomation extends LabelAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static get LABEL() {
    return "Roll";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "roll";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      roll: new fields.StringField({
        label: "Type",
        choices: TERIOCK.options.consequence.rolls,
      }),
      formula: new FormulaField({
        nullable: true,
        deterministic: false,
        label: "Formula",
        hint: "The formula to use for the roll.",
      }),
      merge: new fields.BooleanField({
        label: "Merge",
        hint: "Whether to merge this roll with other valid rolls of the same type that have merging enabled.",
        initial: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["roll", "formula"];
    if (!this.merge) paths.push("title");
    paths.push("merge");
    return paths;
  }

  /** @inheritDoc */
  get buttons() {
    return [
      RollRollableTakeHandler.buildButton(this.roll, this.formula, {
        label: this.title,
        merge: this.merge,
      }),
    ];
  }
}
