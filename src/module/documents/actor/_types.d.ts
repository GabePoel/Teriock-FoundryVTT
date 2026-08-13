import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import {
  TeriockActiveEffect as ActiveEffectClass,
  TeriockActor as ActorClass,
  TeriockTokenDocument,
} from "../_module.mjs";
import { BaseActorSheet } from "../../applications/sheets/actor-sheets/_module.mjs";
import { BaseActorSystem } from "../../data/systems/actors/_module.mjs";

interface ActorSubtype<T extends ActorType> extends ActorClass {
  sheet: ActorSheetMap[T];
  system: ActorSystemMap[T];
  type: T;
}

declare module "./actor.mjs" {
  export default interface TeriockActor {
    _id: Readonly<ID<TeriockActor>>;
    effects: EmbeddedCollection<TeriockActiveEffect>;
    items: EmbeddedCollection<TeriockItem>;
    sheet: BaseActorSheet;
    system: BaseActorSystem;
    type: ActorType;

    get appliedEffects(): ActiveEffectClass[];
    get documentName(): "Actor";
    get id(): ID<TeriockActor>;
    get temporaryEffects(): ActiveEffectClass[];
    get token(): TeriockTokenDocument | null;
    get uuid(): UUID<TeriockActor>;
  }
}

declare global {
  export type TeriockActor<T extends ActorType = ActorType> = T extends unknown ? ActorSubtype<T> : never;
}

export {};
