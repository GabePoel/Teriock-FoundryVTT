import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import { TeriockCombatant } from "../_module.mjs";

declare module "./combat.mjs" {
  export default interface TeriockCombat {
    _id: ID<TeriockCombat>;
    combatants: EmbeddedCollection<TeriockCombatant>;

    get combatant(): TeriockCombatant | null;
    get documentName(): "Combat";
    get id(): ID<TeriockCombat>;
    get uuid(): UUID<TeriockCombat>;
  }
}

export {};
