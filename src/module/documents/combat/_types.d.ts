import { TeriockCombat, TeriockCombatant } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface CombatInterface {
      _id: ID<TeriockCombat>;

      get combatant(): TeriockCombatant | null;

      get documentName(): "Combat";

      get id(): ID<TeriockCombat>;

      get uuid(): UUID<TeriockCombat>;
    }
  }
}

export {};
