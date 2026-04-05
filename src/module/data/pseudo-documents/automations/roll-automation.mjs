import { commands } from "../../../helpers/interaction/_module.mjs";
import { mix } from "../../../helpers/utils.mjs";
import FormulaField from "../../fields/formula-field.mjs";
import { RollActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as mixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {BaseAutomation}
 * @property {Teriock.Keys.RollImpact} roll
 * @property {Teriock.System.FormulaString} formula
 * @property {boolean} merge
 * @mixes TriggerAutomation
 * @mixes LabelAutomation
 */
export default class RollAutomation extends mix(
  BaseAutomation,
  mixins.LabelAutomationMixin,
  mixins.TriggerAutomationMixin,
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
      formula: new FormulaField({
        nullable: true,
        deterministic: false,
      }),
      merge: new fields.BooleanField({ initial: true }),
      roll: new fields.StringField({
        choices: TERIOCK.options.consequence.rolls,
      }),
    });
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
  async _getActivations() {
    return [
      new RollActivation({
        display: { label: this.title },
        formula: this.formula,
        merge: this.merge,
        roll: this.roll,
      }),
    ];
  }

  /** @inheritDoc */
  _onFire() {
    if (!this.document.actor) return;
    const command = commands[this.roll];
    command.primary(this.document.actor, {
      formula: this.formula,
      boost: true,
    });
  }
}
