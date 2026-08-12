import { CompetenceModel } from "../../../models/scaling-models/_module.mjs";

declare module "./attack-activation.mjs" {
  export default interface AttackActivation {
    competence: CompetenceModel;
    armamentId: ID<TeriockItem<"body" | "equipment">> | null;
    attackPenalty: Teriock.System.FormulaString;
    bonus: Teriock.System.FormulaString;
    consumeAmmunition: boolean | null;
    limb: boolean | null;
    sb: boolean | null;
    vitals: boolean | null;
    warded: boolean | null;
    useArmament: boolean;
    threshold: number | null;
  }
}

export {};
