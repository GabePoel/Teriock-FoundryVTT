import { TeriockActor } from "../_module.mjs";

declare module "./combatant.mjs" {
  export default interface TeriockCombatant
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: Teriock.ID<TeriockCombatant>;
    readonly actor: TeriockActor | null;

    get documentName(): "Combatant";

    get id(): Teriock.ID<TeriockCombatant>;

    get uuid(): Teriock.UUID<TeriockCombatant>;
  }
}

export {};
