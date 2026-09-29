import { TeriockCombatant as CombatantClass } from "../_module.mjs";
import { BaseCombatantSystem } from "../../data/systems/combatants/_module.mjs";

declare module "./combatant.mjs" {
  export default interface TeriockCombatant {
    _id: Readonly<ID<TeriockCombatant>>;
    system: BaseCombatantSystem;
    type: CombatantType;

    get actor(): TeriockActor | null;
    get documentName(): "Combatant";
    get id(): ID<TeriockCombatant>;
    get uuid(): UUID<TeriockCombatant>;
  }
}

declare global {
  export type TeriockCombatant<T extends CombatantType = CombatantType> =
    & CombatantClass
    & Subtype<CombatantSystemMap, T>;
}

export {};
