import { RollRollableTakeHandler } from "../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import FormulaField from "../../fields/formula-field.mjs";
import BaseAutomation from "./base-automation.mjs";
import { LabelAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {BaseAutomation}
 * @property {Teriock.Parameters.Consequence.RollConsequenceKey} roll
 * @property {string} formula
 * @property {boolean} merge
 */
export default class RollAutomation extends LabelAutomationMixin(
  BaseAutomation,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.RollAutomation",
  ];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ROLLS.Take.label";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "roll";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      roll: new fields.StringField({
        choices: TERIOCK.options.consequence.rolls,
      }),
      formula: new FormulaField({
        nullable: true,
        deterministic: false,
      }),
      merge: new fields.BooleanField({ initial: true }),
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
