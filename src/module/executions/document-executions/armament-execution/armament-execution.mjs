import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import {
  makeDamageDrainTypePanels,
  makeDamageTypeButtons,
} from "../../../helpers/html.mjs";
import { TakeRollableTakeHandler } from "../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import BaseDocumentExecution from "../base-document-execution/base-document-execution.mjs";

/**
 * @implements {Teriock.Execution.ArmamentExecutionInterface}
 */
export default class ArmamentExecution extends BaseDocumentExecution {
  /**
   * @param {Teriock.Execution.ArmamentExecutionOptions} options
   */
  constructor(
    options = /** @type {Teriock.Execution.ArmamentExecutionOptions} */ {},
  ) {
    super(options);
    const { crit = false, deals = ["damage"], bonusDamage = "" } = options;
    this.crit = crit;
    this.deals = new Set(deals);
    this.bonusDamage = bonusDamage;
    if (options.formula === undefined) {
      this.formula = this.source.system.damage.base.formula;
    }
  }

  crit = false;

  /** @inheritDoc */
  get activeAutomations() {
    const automations = super.activeAutomations;
    for (const property of this.source.properties) {
      automations.push(...property.system.activeAutomations);
    }
    return automations;
  }

  /** @inheritDoc */
  get flavor() {
    if (this.deals.size === 1) {
      return `${TERIOCK.options.take[Array.from(this.deals)[0]].label} Roll`;
    } else {
      return "Multi-Effect Roll";
    }
  }

  /** @inheritDoc */
  async _buildButtons() {
    if (this.rolls.length > 0) {
      const roll = this.rolls[0];
      for (const rollType of this.deals) {
        this.buttons.push(
          TakeRollableTakeHandler.buildButton(rollType, roll.total),
        );
      }
      if (this.deals.has("damage")) {
        this.buttons.push(...makeDamageTypeButtons(roll));
      }
    }
    await super._buildButtons();
  }

  /** @inheritDoc */
  async _buildPanels() {
    await super._buildPanels();
    if (this.rolls.length > 0) {
      const roll = this.rolls[0];
      this.panels.push(...(await makeDamageDrainTypePanels(roll)));
    }
  }

  /** @inheritDoc */
  async _buildRolls() {
    await super._buildRolls();
    if (this.crit) {
      for (const roll of this.rolls) {
        roll.alter(2, 0, { multiplyNumeric: false });
      }
    }
  }

  /** @inheritDoc */
  async _postExecute() {
    await super._postExecute();
    await this.actor?.hookCall("useArmament", { execution: this });
  }

  /** @inheritDoc */
  async _prepareFormula() {
    if (formulaExists(this.bonusDamage)) {
      this.formula = addFormula(this.formula, this.bonusDamage);
    }
  }
}
