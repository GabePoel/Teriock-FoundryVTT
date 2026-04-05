import { icons } from "../../../constants/display/icons.mjs";
import { addFormula } from "../../../helpers/formula.mjs";
import commands from "../../../helpers/interaction/commands/_module.mjs";
import { getRollIcon, objectMap } from "../../../helpers/utils.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.RollImpact} roll
 * @property {Teriock.System.FormulaString} formula
 * @property {boolean} merge
 */
export default class RollActivation extends BaseActivation {
  /** @inheritDoc */
  static get ICON() {
    return icons.ui.dice;
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

  /**
   * Process an array of activations to merge the rolls that should be merged.
   * @param {(BaseActivation|RollActivation)[]} activations
   * @returns {(BaseActivation|RollActivation)[]}
   */
  static mergeRolls(activations) {
    const toMerge = activations.filter((a) => a.type === this.TYPE && a.merge);
    const mergeIds = toMerge.map((a) => a.id);

    // Filter activations to be merged out of the main activation array
    const out = activations.filter((a) => !mergeIds.includes(a.id));

    // Create aggregate formula from the merged activations
    /** @type {Partial<Record<Teriock.Keys.RollImpact, RollActivation[]>>} */
    const activationsByType = {};
    for (const a of toMerge) {
      const rollType = a.roll;
      if (!activationsByType[rollType]) activationsByType[rollType] = [];
      activationsByType[rollType].push(a);
    }
    const formulasByType = objectMap(activationsByType, (acts) =>
      acts.reduce((a, b) => addFormula(a, b.formula), ""),
    );

    // Convert aggregate formulas back into activations
    out.push(
      ...Object.entries(formulasByType).map(
        ([rollType, formula]) =>
          new RollActivation({ roll: rollType, formula: formula }),
      ),
    );
    return out;
  }

  /** @inheritDoc */
  get icon() {
    return this.display.icon || getRollIcon(this.formula) || super.icon;
  }

  /** @inheritDoc */
  get label() {
    return (
      this.display.label ||
      `Roll ${TERIOCK.options.take[this.roll]?.label}` ||
      super.label()
    );
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await commands[this.roll].primary(actor, {
        formula: this.formula,
        type: this.roll,
        boost: true,
      });
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await commands[this.roll].primary(actor, {
        formula: this.formula,
        type: this.roll,
        boost: true,
      });
    }
  }
}
