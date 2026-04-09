import {
  boostDialog,
  selectDocumentsDialog,
} from "../../../applications/dialogs/_module.mjs";
import { HarmRoll } from "../../../dice/rolls/_module.mjs";
import { AutomationCollection } from "../../../documents/collections/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import BaseDocumentExecution from "../base-document-execution/base-document-execution.mjs";

/**
 * @implements {Teriock.Execution.ArmamentExecutionInterface}
 * @param {HarmRoll[]} rolls
 */
export default class ArmamentExecution extends BaseDocumentExecution {
  /**
   * @param {Teriock.Execution.ArmamentExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    this.crit = options.crit ?? false;
    this.deals = new Set(
      options.deals ?? Array.from(this.source.system.deals) ?? ["damage"],
    );
    this.bonusDamage = options.bonusDamage ?? "";
    this.showDialog = options.showDialog;
    this.twoHanded = options.twoHanded && this.source.system.hasTwoHandedAttack;
    this.formula =
      options.formula ??
      (this.twoHanded
        ? this.source.system.damage.twoHanded
        : this.source.system.damage.base);
  }

  crit = false;

  /**
   * A copy of the roll for each thing this deals.
   * @returns {HarmRoll[]}
   */
  get #typedRolls() {
    if (this.rolls.length === 0) return [];
    const roll = this.rolls[0];
    return Array.from(this.deals).map((impact) => {
      const impactRoll = roll.clone({ evaluated: true });
      impactRoll.impact = impact;
      return impactRoll;
    });
  }

  /** @inheritDoc */
  get _RollClass() {
    return HarmRoll;
  }

  /** @inheritDoc */
  get automations() {
    const automations = [...this._automations];
    for (const p of this.source.properties) {
      automations.push(...p.system.automations.contents);
    }
    return new AutomationCollection(automations.map((a) => [a.id, a]));
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Armament"];
  }

  /** @inheritDoc */
  get flavor() {
    if (this.deals.size === 1) {
      return _loc("TERIOCK.ROLLS.Base.name", {
        value: TERIOCK.options.impact[Array.from(this.deals)[0]].label,
      });
    } else {
      return _loc("TERIOCK.ROLLS.Harm.multi");
    }
  }

  /** @inheritDoc */
  async _buildActivations() {
    for (const roll of this.#typedRolls) {
      this.activations.push(...(await roll.getActivations()));
    }
    await super._buildActivations();
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
        if (this.deals.size === 1) roll.impact = Array.from(this.deals)[0];
        else roll.impact = undefined;
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
    const onUseIds = Array.from(this.source.system.onUse);
    const onUseAbilities = /** @type {TeriockAbility[]} */ onUseIds
      .map((id) => this.source.effects.get(id))
      .filter((a) => a);
    if (onUseAbilities.length > 0) {
      const usedAbilities = await selectDocumentsDialog(onUseAbilities, {
        hint: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.onUse.hint", {
          name: this.source.name,
        }),
        title: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.onUse.title"),
      });
      for (const ability of usedAbilities) {
        if (ability.system.consumable && this.source.system.consumable) {
          if (
            ability.system.quantity !== 1 &&
            this.source.isOwner &&
            !this.source.inCompendium
          ) {
            await this.source.setFlag("teriock", "dontConsume", true);
          }
        }
        await ability.use();
      }
    }
    await super._postExecute();
  }

  /** @inheritDoc */
  async _prepareFormula() {
    if (formulaExists(this.bonusDamage)) {
      this.formula = addFormula(this.formula, this.bonusDamage);
    }
  }

  /** @inheritDoc */
  getScope(scope = {}) {
    return Object.assign(super.getScope(scope), { armament: this.source });
  }
}
