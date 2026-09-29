import { ThresholdRoll } from "../../dice/rolls/_module.mjs";
import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { CombatantGroup } = foundry.documents;

/**
 * The Teriock CombatantGroup implementation.
 * @extends {CombatantGroup}
 * @mixes BaseDocument
 */
export default class TeriockCombatantGroup extends mixClasses(CombatantGroup, BaseDocumentMixin) {
  /**
   * The default Combatant.
   * @returns {TeriockCombatant|null}
   */
  get defaultCombatant() {
    return this.system.commander ?? this.members.first() ?? null;
  }

  /**
   * Acquire the default dice formula which should be used to roll initiative for this CombatantGroup.
   * @returns {Teriock.System.FormulaString}
   */
  _getInitiativeFormula() {
    return this.defaultCombatant?._getInitiativeFormula() ?? CONFIG.Combat.initiative.formula;
  }

  /**
   * Get a Roll object which represents the initiative roll for this CombatantGroup.
   * @param {Teriock.System.FormulaString} formula
   * @returns {ThresholdRoll}
   */
  getInitiativeRoll(formula) {
    formula ||= this._getInitiativeFormula();
    return this.defaultCombatant?.getInitiativeRoll(formula) ?? new ThresholdRoll(formula, {});
  }

  /**
   * Roll initiative for this particular CombatantGroup.
   * @param {Teriock.System.FormulaString} formula
   * @returns {Promise<TeriockCombatantGroup>}
   */
  async rollInitiative(formula) {
    const defaultCombatant = this.defaultCombatant;
    if (defaultCombatant) {
      await defaultCombatant?.rollInitiative(formula);
      const initiative = defaultCombatant?._source.initiative;
      return this.update({ initiative });
    }
    const roll = this.getInitiativeRoll(formula);
    await roll.evaluate();
    return this.update({ initiative: roll.total });
  }
}
