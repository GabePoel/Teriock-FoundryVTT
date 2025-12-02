import { TeriockActor } from "../_module.mjs";

declare module "./combatant.mjs" {
  export default interface TeriockCombatant
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockCombatant>;
    readonly actor: TeriockActor | null;

    get documentName(): "Combatant";

    get id(): ID<TeriockCombatant>;

    get uuid(): UUID<TeriockCombatant>;
  }
}

export {};
