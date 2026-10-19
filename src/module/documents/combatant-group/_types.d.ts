import { TeriockCombat, TeriockCombatant, TeriockCombatantGroup as CombatantGroupClass } from "../_module.mjs";
import { BaseGroupSystem } from "../../data/systems/groups/_module.mjs";

declare module "./combatant-group.mjs" {
  // @ts-expect-error Foundry changes Set and that makes this break I guess
  export default interface TeriockCombatantGroup {
    _id: Readonly<ID<TeriockCombatantGroup>>;
    system: BaseGroupSystem;
    members: Set<TeriockCombatant>;

    readonly parent: TeriockCombat;
    get id(): ID<TeriockCombatantGroup>;
    get uuid(): UUID<TeriockCombatantGroup>;
  }
}

declare global {
  export type TeriockCombatantGroup<T extends CombatantGroupType = CombatantGroupType> =
    & CombatantGroupClass
    & Subtype<CombatantGroupSystemMap, T>;
}

export {};
