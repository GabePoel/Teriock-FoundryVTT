import PiercingModel from "../../../data/models/scaling-models/piercing-model/piercing-model.mjs";

declare global {
  namespace Teriock.Execution {
    export type AttackExecutionData = {
      consumeAmmunition: boolean;
      existingAttackPenalty: number;
      incurredAttackPenalty: Teriock.System.FormulaString;
      piercing: PiercingModel;
      sb: boolean;
      useArmament: boolean;
      vitals: boolean;
      warded: boolean;
    };
  }
}

export {};
