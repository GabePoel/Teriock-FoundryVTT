import { commands } from "../../../helpers/interaction/_module.mjs";
import { RollRollableTakeHandler } from "../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import FormulaField from "../../fields/formula-field.mjs";
import BaseAutomation from "./base-automation.mjs";
import {
  LabelAutomationMixin,
  TriggerAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {BaseAutomation}
 * @property {Teriock.Parameters.Consequence.RollConsequenceKey} roll
 * @property {string} formula
 * @property {boolean} merge
 * @mixes TriggerAutomation
 * @mixes LabelAutomation
 */
export default class RollAutomation extends TriggerAutomationMixin(
  LabelAutomationMixin(BaseAutomation),
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
  get _buttons() {
    return [
      RollRollableTakeHandler.buildButton(this.roll, this.formula, {
        label: this.title,
        merge: this.merge,
      }),
    ];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["roll", "formula"];
    if (!this.merge) paths.push("title");
    if (!this.trigger) paths.push("merge");
    paths.push(...super._formPaths);
    return paths;
  }

  /** @inheritDoc */
  _onFire() {
    if (!this.document.actor) return;
    const command = commands[this.roll];
    command
      .primary(this.document.actor, { formula: this.formula, boost: true })
      .then();
  }
}
