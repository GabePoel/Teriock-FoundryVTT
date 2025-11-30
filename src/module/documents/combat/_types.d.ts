import { TeriockCombatant } from "../_module.mjs";

declare module "./combat.mjs" {
  export default interface TeriockCombat
    extends Teriock.Documents.Interface<TeriockCombatant> {
    _id: ID<TeriockCombat>;
    readonly combatant: TeriockCombatant | null;

    get documentName(): "Combat";

    get id(): ID<TeriockCombat>;

    get uuid(): UUID<TeriockCombat>;
  }
}

export {};
