import { mixClasses } from "../../../helpers/construction.mjs";
import { addFormula } from "../../../helpers/formula.mjs";
import {
  AbilityExecutionActorUpdatePart,
  AbilityExecutionChatPart,
  AbilityExecutionConstructor,
  AbilityExecutionGetInputPart,
  AbilityExecutionRollsPart,
} from "./parts/_module.mjs";

/**
 * @extends {AbilityExecutionConstructor}
 * @extends {DocumentExecution}
 * @mixes AbilityExecutionActorUpdate
 * @mixes AbilityExecutionChat
 * @mixes AbilityExecutionGetInput
 * @mixes AbilityExecutionRolls
 * @mixes AttackExecution
 */
export default class AbilityExecution
  extends mixClasses(
    AbilityExecutionConstructor,
    AbilityExecutionGetInputPart,
    AbilityExecutionActorUpdatePart,
    AbilityExecutionRollsPart,
    AbilityExecutionChatPart,
  )
{
  /** @inheritDoc */
  get competenceImprovesFormula() {
    return this.isAttack || this.isFeat;
  }

  /** @inheritDoc */
  get hasBonus() {
    return this.isAttack || this.isBlock || this.isFeat;
  }

  /** @inheritDoc */
  async _improveFormula() {
    if (this.competenceImprovesFormula && this.heightened > 0) {
      this.formula = addFormula(this.formula, "@h");
    }
    await super._improveFormula();
  }

  /** @inheritDoc */
  async _prepareBaseFormula() {
    if (this.isAttack) { return super._prepareBaseFormula(); }
    if (this.isFeat) { this.formula = "10"; }
    else if (this.isBlock) { this.formula = "10 + @av + @bv"; }
  }

  /** @inheritDoc */
  getRollData() {
    return Object.assign(super.getRollData(), { bv: this.bv ?? 0, h: this.heightened });
  }

  /** @inheritDoc */
  getScope(scope = {}) {
    return Object.assign(super.getScope(scope), { ability: this.source });
  }
}
