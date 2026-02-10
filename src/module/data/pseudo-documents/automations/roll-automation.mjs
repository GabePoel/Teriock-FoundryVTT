import { RollRollableTakeHandler } from "../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import FormulaField from "../../fields/formula-field.mjs";
import BaseAutomation from "./base-automation.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Parameters.Consequence.RollConsequenceKey} roll
 * @property {string} formula
 * @property {string} name
 * @property {boolean} merge
 */
export default class RollAutomation extends BaseAutomation {
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
      title: new fields.StringField({
        label: "Title",
        hint: "The text to display on the roll button.",
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
    const paths = ["roll", "formula", "merge"];
    if (this.roll === "other") paths.push("title");
    return paths;
  }

  /** @inheritDoc */
  get buttons() {
    return [
      RollRollableTakeHandler.buildButton(this.roll, this.formula, {
        merge: this.merge,
      }),
    ];
  }
}
