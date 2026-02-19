import { boostDialog } from "../../../applications/dialogs/_module.mjs";
import { HarmRoll } from "../../../dice/rolls/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import BaseDocumentExecution from "../base-document-execution/base-document-execution.mjs";

/**
 * @implements {Teriock.Execution.ArmamentExecutionInterface}
 */
export default class ArmamentExecution extends BaseDocumentExecution {
  /**
   * @param {Teriock.Execution.ArmamentExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    const { crit = false, deals = ["damage"], bonusDamage = "" } = options;
    this.crit = crit;
    this.deals = new Set(deals);
    this.bonusDamage = bonusDamage;
    this.showDialog = options.showDialog;
    if (options.formula === undefined) {
      this.formula = this.source.system.damage.base.formula;
    }
  }

  crit = false;

  /**
   * A copy of the roll for each thing this deals.
   * @returns {HarmRoll[]}
   */
  get #typedRolls() {
    if (this.rolls.length === 0) return [];
    const roll = this.rolls[0];
    return Array.from(this.deals).map((take) => {
      const takeRoll = /** @type {HarmRoll} */ roll.clone({ evaluated: true });
      takeRoll.take = take;
      return takeRoll;
    });
  }

  /** @inheritDoc */
  get _RollClass() {
    return HarmRoll;
  }

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
    for (const roll of this.#typedRolls) {
      this.buttons.push(...(await roll.getButtons()));
    }
    await super._buildButtons();
  }

  /** @inheritDoc */
  async _buildPanels() {
    await super._buildPanels();
    for (const roll of this.#typedRolls) {
      this.panels.push(...(await roll.getPanels()));
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
  async _getInput() {
    if (this.showDialog && formulaExists(this.formula)) {
      this.formula = await boostDialog(this.formula, { crit: this.crit });
      this.crit = false;
    }
    await super._getInput();
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
