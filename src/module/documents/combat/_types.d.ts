import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockCombatant, TeriockCombatantGroup } from "../_module.mjs";

declare module "./combat.mjs" {
  export default interface TeriockCombat {
    _id: Readonly<ID<TeriockCombat>>;
    combatants: EmbeddedCollection<TeriockCombatant>;
    groups: EmbeddedCollection<TeriockCombatantGroup>;

    get combatant(): TeriockCombatant | null;
    get documentName(): "Combat";
    get id(): ID<TeriockCombat>;
    get uuid(): UUID<TeriockCombat>;
  }
}

export {};
