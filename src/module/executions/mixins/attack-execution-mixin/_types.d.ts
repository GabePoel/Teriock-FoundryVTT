import { TeriockToken } from "../../../canvas/placeables/_module.mjs";
import PiercingModel from "../../../data/models/scaling-models/piercing-model/piercing-model.mjs";

declare global {
  namespace Teriock.Execution {
    export interface AttackExecutionData {
      consumeAmmunition: boolean;
      existingAttackPenalty: number;
      incurredAttackPenalty: Teriock.System.FormulaString;
      piercing: PiercingModel;
      sb: boolean;
      useArmament: boolean;
      vitals: boolean;
      warded: boolean;

      ammunition: TeriockItem<"equipment"> | null | undefined;
      armament: TeriockItem<"body" | "equipment"> | null;
      limb: boolean;
      rootBonus: Teriock.System.FormulaString;
      targets: Set<TeriockToken>;
    }
  }
}

export {};
