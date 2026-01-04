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
    if (["attack", "feat"].includes(this.source.system.interaction)) {
      await super._improveFormula();
      if (this.heightened > 0) {
        this.formula = addFormula(this.formula, "@h");
      }
      if (this.source.system.interaction === "attack") {
        if (this.piercing.av0) {
          this.formula = addFormula(this.formula, "@av0");
        }
        if (this.piercing.sb) {
          this.formula = addFormula(this.formula, "@sb");
        }
        if (this.armament?.system.hit.nonZero) {
          this.formula = addFormula(this.formula, "@hit");
        }
      }
    }
  }

  /** @inheritDoc */
  async _postExecute() {
    await this.executePseudoHookMacros("execution");
    await this.actor?.hookCall("useAbility", { execution: this });
  }

  /** @inheritDoc */
  async _prepareBaseFormula() {
    if (this.source.system.interaction === "attack") {
      await super._prepareBaseFormula();
      this.formula = addFormula(this.formula, "@ap");
    } else if (this.source.system.interaction === "feat") {
      this.formula = "10";
    } else if (this.source.system.interaction === "block") {
      this.formula = "10 + @av + @bv";
    }
  }
}
