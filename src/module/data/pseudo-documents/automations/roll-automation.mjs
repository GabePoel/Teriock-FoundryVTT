import { commands } from "../../../helpers/interaction/_module.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { mix, objectMap } from "../../../helpers/utils.mjs";
import FormulaField from "../../fields/formula-field.mjs";
import { RollActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import * as mixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {BaseAutomation}
 * @property {Teriock.Keys.Impact} impact
 * @property {Teriock.System.FormulaString} formula
 * @property {boolean} merge
 * @mixes TriggerAutomation
 * @mixes DisplayAutomation
 */
export default class RollAutomation extends mix(
  BaseAutomation,
  mixins.DisplayAutomationMixin,
  mixins.TriggerAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Roll",
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
      impact: new fields.StringField({
        choices: localizeChoices(
          objectMap(TERIOCK.options.impact, (i) => i.deal),
        ),
      }),
      merge: new fields.BooleanField({ initial: true }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (data.roll) data.impact = data.roll;
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["impact", "formula"];
    if (!this.merge) paths.push("display.label");
    if (!this.trigger) paths.push("merge");
    paths.push(...super._formPaths);
    return paths;
  }

  /** @inheritDoc */
  async _getActivations() {
    if (this.formula && this.impact) {
      return [
        new RollActivation({
          display: this.display,
          formula: this.formula,
          merge: this.merge,
          impact: this.impact,
        }),
      ];
    }
    return [];
  }

  /** @inheritDoc */
  _onFire() {
    if (!this.document.actor) return;
    const command = commands[this.impact];
    command.primary(this.document.actor, {
      formula: this.formula,
      boost: true,
    });
  }
}
