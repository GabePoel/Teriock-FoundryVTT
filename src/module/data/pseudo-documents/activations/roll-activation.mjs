import { icons } from "../../../constants/display/icons.mjs";
import commands from "../../../helpers/interaction/commands/_module.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import RollAutomation from "../automations/roll-automation.mjs";
import { AutomationActivationFactory } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.Impact} impact
 * @property {Teriock.System.FormulaString} formula
 * @property {boolean} merge
 * @property {number} boosts
 */
export default class RollActivation extends AutomationActivationFactory(RollAutomation) {
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
  get tooltip() {
    return this.formula;
  }

  /** @inheritDoc */
  async primaryAction() {
    let actors = this.actors;
    if (!this.actors.length) {
      actors = [null];
    }
    for (const actor of actors) {
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
    let actors = this.actors;
    if (!this.actors.length) {
      actors = [null];
    }
    for (const actor of actors) {
      await commands[this.impact].primary(actor, {
        boost: true,
        boosts: this.boosts,
        formula: this.formula,
        type: this.impact,
      });
    }
  }
}
