import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import {
  makeDamageDrainTypePanels,
  makeDamageTypeButtons,
} from "../../../helpers/html.mjs";
import { buttonHandlers } from "../../../helpers/interaction/_module.mjs";
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
    const {
      crit = false,
      damage = true,
      drain = false,
      wither = false,
      bonusDamage = "",
    } = options;
    this.crit = crit;
    this.damage = damage;
    this.drain = drain;
    this.wither = wither;
    this.bonusDamage = bonusDamage;
    if (options.formula === undefined) {
      this.formula = this.source.system.damage.base.formula;
    }
  }

  crit = false;

  /** @inheritDoc */
  get flavor() {
    if (this.damage && !this.drain && !this.wither) {
      return "Damage Roll";
    } else if (this.drain && !this.damage && !this.wither) {
      return "Drain Roll";
    } else if (this.wither && !this.damage && !this.drain) {
      return "Wither Roll";
    }
    return "Harm Roll";
  }

  /** @inheritDoc */
  async _buildButtons() {
    if (this.rolls.length > 0) {
      const roll = this.rolls[0];
      if (this.damage) {
        this.buttons.push(
          buttonHandlers["take-rollable-take"].buildButton(
            "damage",
            roll.total,
          ),
        );
      }
      if (this.drain) {
        this.buttons.push(
          buttonHandlers["take-rollable-take"].buildButton("drain", roll.total),
        );
      }
      if (this.wither) {
        this.buttons.push(
          buttonHandlers["take-rollable-take"].buildButton(
            "wither",
            roll.total,
          ),
        );
      }
      this.buttons.push(...makeDamageTypeButtons(roll));
    }
    for (const property of this.source.properties) {
      const newButtons = [];
      property.system.activeAutomations.forEach((a) =>
        newButtons.push(...a.buttons),
      );
      this.buttons.push(...newButtons);
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
