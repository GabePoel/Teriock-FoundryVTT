import { Combatant } from "@client/documents/_module.mjs";

import { TeriockCombat, TeriockCombatant as CombatantClass } from "../_module.mjs";
import { BaseCombatantSystem } from "../../data/systems/combatants/_module.mjs";

declare module "./combatant.mjs" {
  // @ts-expect-error Declare base class
  export default interface TeriockCombatant extends Combatant {
    _id: Readonly<ID<TeriockCombatant>>;
    system: BaseCombatantSystem;
    type: CombatantType;

    readonly parent: TeriockCombat;
    readonly actor: TeriockActor;
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
