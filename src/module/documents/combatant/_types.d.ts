import { TeriockCombat, TeriockCombatant } from "../_module.mjs";

declare global {
  namespace Teriock.Documents {
    export interface CombatantInterface {
      _id: ID<TeriockCombatant>;
      parent: TeriockCombat;

      get actor(): GenericActor | null;

      get documentName(): "Combatant";

      get id(): ID<TeriockCombatant>;

      get uuid(): UUID<TeriockCombatant>;
    }
  }
}

export {};
