import { icons } from "../../../constants/display/icons.mjs";
import { addFormula } from "../../../helpers/formula.mjs";
import commands from "../../../helpers/interaction/commands/_module.mjs";
import { getRollIcon, objectMap } from "../../../helpers/utils.mjs";
import RollAutomation from "../automations/roll-automation.mjs";
import { AutomationActivationFactory } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.Impact} impact
 * @property {Teriock.System.FormulaString} formula
 * @property {boolean} merge
 * @property {number} boosts
 */
export default class RollActivation extends AutomationActivationFactory(
  RollAutomation,
) {
  /** @inheritDoc */
  static get ICON() {
    return icons.ui.dice;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      boosts: new fields.NumberField(),
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
    /** @type {Partial<Record<Teriock.Keys.Impact, RollActivation[]>>} */
    const activationsByType = {};
    for (const a of toMerge) {
      const impact = a.impact;
      if (!activationsByType[impact]) activationsByType[impact] = [];
      activationsByType[impact].push(a);
    }
    const formulasByType = objectMap(activationsByType, (acts) =>
      acts.reduce((a, b) => addFormula(a, b.formula), ""),
    );

    // Convert aggregate formulas back into activations
    out.push(
      ...Object.entries(formulasByType).map(
        ([rollType, formula]) =>
          new RollActivation({ impact: rollType, formula: formula }),
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
      _loc("TERIOCK.ACTIVATIONS.Roll.BUTTON", {
        impact: TERIOCK.config.impact[this.impact]?.label,
      }) ||
      super.label()
    );
  }

  /** @inheritDoc */
  async primaryAction() {
    if (!this.checkActors()) return;
    for (const actor of this.actors) {
      await commands[this.impact].primary(actor, {
        boost: true,
        boosts: this.boosts,
        formula: this.formula,
        type: this.impact,
      });
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    if (!this.checkActors()) return;
    for (const actor of this.actors) {
      await commands[this.impact].primary(actor, {
        boost: true,
        boosts: this.boosts,
        formula: this.formula,
        type: this.impact,
      });
    }
  }
}
