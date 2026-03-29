import { addFormula } from "../../../helpers/formula.mjs";
import {
  AbilityExecutionActorUpdatePart,
  AbilityExecutionChatPart,
  AbilityExecutionConstructor,
  AbilityExecutionGetInputPart,
  AbilityExecutionRollsPart,
} from "./parts/_module.mjs";

//noinspection JSClosureCompilerSyntax,JSUnresolvedReference
/**
 * @extends {AbilityExecutionConstructor}
 * @extends {BaseDocumentExecution}
 * @mixes AbilityExecutionActorUpdate
 * @mixes AbilityExecutionChat
 * @mixes AbilityExecutionGetInput
 * @mixes AbilityExecutionRolls
 * @mixes ThresholdExecution
 */
export default class AbilityExecution extends AbilityExecutionChatPart(
  AbilityExecutionRollsPart(
    AbilityExecutionActorUpdatePart(
      AbilityExecutionGetInputPart(AbilityExecutionConstructor),
    ),
  ),
) {
  /** @inheritDoc */
  get competenceImprovesFormula() {
    return this.isAttack || this.isFeat;
  }

  /** @inheritDoc */
  get hasBonus() {
    return this.isAttack || this.isBlock || this.isFeat;
  }

  /** @inheritDoc */
  get rollData() {
    const rollData = super.rollData;
    const rollAdditions = {
      av0: Number(this.piercing.av0) * 2,
      "av0.wep": Number(this.armament?.system.piercing.av0) * 2,
      h: this.heightened,
      sb: Number(this.sb),
      ub: Number(this.piercing.ub),
      "ub.wep": Number(this.armament?.system.piercing.ub),
      warded: Number(this.warded),
      "warded.wep": Number(this.armament?.system.warded),
    };
    if (this.armament) {
      rollAdditions.bv = this.armament.system.bv.value;
      rollAdditions.hit = this.armament.system.hit.formula;
      rollAdditions["hit.web"] = this.armament.system.hit.formula;
    }
    Object.assign(rollData, rollAdditions);
    return rollData;
  }

  /** @inheritDoc */
  async _improveFormula() {
    if (this.isAttack) {
      if (this.piercing.av0) this.formula = addFormula(this.formula, "@av0");
      if (this.sb) this.formula = addFormula(this.formula, "@sb");
    }
    if (this.competenceImprovesFormula) {
      if (this.heightened > 0) this.formula = addFormula(this.formula, "@h");
    }
    await super._improveFormula();
  }

  /** @inheritDoc */
  async _prepareBaseFormula() {
    if (this.isAttack) {
      await super._prepareBaseFormula();
      this.formula = addFormula(this.formula, "@ap");
    } else if (this.isFeat) {
      this.formula = "10";
    } else if (this.isBlock) {
      this.formula = "10 + @av + @bv";
    }
  }

  /** @inheritDoc */
  getScope(scope = {}) {
    return Object.assign(super.getScope(scope), { ability: this.source });
  }
}
