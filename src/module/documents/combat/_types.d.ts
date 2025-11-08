import { TeriockCombatant } from "../_module.mjs";

declare module "./combat.mjs" {
  export default interface TeriockCombat
    extends Teriock.Documents.Interface<TeriockCombatant> {
    _id: Teriock.ID<TeriockCombat>;
    readonly combatant: TeriockCombatant | null;

    get documentName(): "Combat";

    get id(): Teriock.ID<TeriockCombat>;

    get uuid(): Teriock.UUID<TeriockCombat>;
  }
}

export {};
