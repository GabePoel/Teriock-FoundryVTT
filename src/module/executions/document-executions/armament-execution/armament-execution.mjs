import { boostDialog, selectDocumentsDialog } from "../../../applications/dialogs/_module.mjs";
import { HarmRoll } from "../../../dice/rolls/_module.mjs";
import { TypeCollection } from "../../../documents/collections/_module.mjs";
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
    this.impacts = new Set(options.impacts ?? Array.from(this.source.system.impacts) ?? ["damage"]);
    this.bonus = options.bonus ?? "";
    this.showDialog = options.showDialog;
    this.twoHanded = options.twoHanded && this.source.system.hasTwoHandedAttack;
    this.formula = options.formula
      ?? (this.twoHanded ? this.source.system.damage.twoHanded : this.source.system.damage.base);
  }

  /**
   * A single impact if this only has one.
   * @returns {Teriock.Keys.Impact|null}
   */
  get #singleImpact() {
    if (this.impacts.size === 1) { return Array.from(this.impacts)[0]; }
    return null;
  }

  /**
   * A copy of the roll for each impact this deals.
   * @returns {HarmRoll[]}
   */
  get #typedRolls() {
    if (this.rolls.length === 0) { return []; }
    const roll = this.rolls[0];
    return Array.from(this.impacts).map(impact => {
      const impactRoll = roll.clone({ evaluated: true });
      impactRoll.impact = impact;
      return impactRoll;
    });
  }

  crit = false;

  /** @inheritDoc */
  get _RollClass() {
    return HarmRoll;
  }

  /** @inheritDoc */
  get automations() {
    const automations = [...this._automations];
    for (const p of this.source.properties) { automations.push(...p.system.automations.contents); }
    return new TypeCollection(automations.map(a => [a.id, a]));
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Armament"];
  }

  /** @inheritDoc */
  get flavor() {
    if (this.impacts.size === 1) {
      return _loc("TERIOCK.ROLLS.Base.name", { value: TERIOCK.config.impact[Array.from(this.impacts)[0]].label });
    }
    return _loc("TERIOCK.ROLLS.Harm.multi");
  }

  /** @inheritDoc */
  async _buildActivations() {
    for (const roll of this.#typedRolls) { this.activations.push(...(await roll.getActivations())); }
    await super._buildActivations();
  }

  /** @inheritDoc */
  async _buildPanels() {
    await super._buildPanels();
    for (const roll of this.#typedRolls) { this.panels.push(...(await roll.getPanels())); }
  }

  /** @inheritDoc */
  async _buildRolls() {
    await super._buildRolls();
    if (this.crit) {
      for (const roll of this.rolls) {
        roll.impact = this.#singleImpact;
        roll.alter(2, 0, { multiplyNumeric: false });
      }
    }
  }

  /** @inheritDoc */
  async _getInput() {
    let boosts = 0;
    for (const impact of this.impacts) {
      if (this._hasBoostForImpact(impact)) {
        const amt = this._boostsResolved[impact];
        if (amt > boosts) { boosts = amt; }
      }
    }
    if (this.showDialog && formulaExists(this.formula)) {
      this.formula = await boostDialog(this.formula, {
        boosts,
        crit: this.crit,
        document: this.source,
        impact: this.#singleImpact,
      });
      if (this.formula === null) { return false; }
      this.crit = false;
    }
    await super._getInput();
  }

  /** @inheritDoc */
  _hasBoostForImpact(impact) {
    return (super._hasBoostForImpact(impact)
      || (this._boostsResolved[impact] && this.impacts.has(impact) && formulaExists(this.formula)));
  }

  /** @inheritDoc */
  async _postExecute() {
    const onUseAbilities = this.source.system.onUseAbilities;
    if (onUseAbilities.length > 0) {
      const usedAbilities = await selectDocumentsDialog(onUseAbilities, {
        hint: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.onUse.hint", { name: this.source.name }),
        title: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.onUse.title"),
      });
      for (const ability of usedAbilities) {
        if (ability.system.consumable && this.source.system.consumable) {
          if (ability.system.quantity !== 1 && this.source.isOwner && !this.source.inCompendium) {
            await this.source.setFlag("teriock", "dontConsume", true);
          }
        }
        await ability.use({ ...this.options, armament: this.source });
      }
    }
    await super._postExecute();
  }

  /** @inheritDoc */
  async _prepareFormula() {
    if (formulaExists(this.bonus)) { this.formula = addFormula(this.formula, this.bonus); }
  }

  /** @inheritDoc */
  getScope(scope = {}) {
    return Object.assign(super.getScope(scope), { armament: this.source });
  }
}
