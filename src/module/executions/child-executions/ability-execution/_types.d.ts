import { BaseAffinity } from "../../../data/pseudo-documents/affinities/abstract/_module.mjs";
import { ExecutionPseudoCollection } from "../../../data/pseudo-documents/collections/_module.mjs";
import { BaseExpiration } from "../../../data/pseudo-documents/expirations/abstract/_module.mjs";

declare module "./ability-execution.mjs" {
  export default interface AbilityExecution {
    autoPayCosts: boolean;
    bv: number;
    consumeEquipment: boolean;
    executionTime: Teriock.Keys.ExecutionTime;
    noHeighten: boolean;
    preventAttack: boolean;
    preventBlockCone: boolean;
    preventFeat: boolean;
    preventThreshold: boolean;

    affinities: ExecutionPseudoCollection<BaseAffinity>;
    costs: Record<Teriock.Keys.PrimaryCost, number>;
    expirations: ExecutionPseudoCollection<BaseExpiration>;
  }
}

export {};
