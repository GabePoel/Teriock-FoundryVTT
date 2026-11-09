import { EmbeddedCollection } from "@common/abstract/_module.mjs";

import {
  TeriockActiveEffect as ActiveEffectClass,
  TeriockActor as ActorClass,
  TeriockTokenDocument,
} from "../_module.mjs";
import { BaseActorSystem } from "../../data/systems/actors/_module.mjs";

declare module "./actor.mjs" {
  export default interface TeriockActor {
    _id: Readonly<ID<TeriockActor>>;
    effects: EmbeddedCollection<TeriockActiveEffect>;
    items: EmbeddedCollection<TeriockItem>;
    system: BaseActorSystem;
    type: ActorType;

    readonly parent: TeriockTokenDocument | null;
    get _cache(): Teriock.Documents.ActorCache;
    get appliedEffects(): ActiveEffectClass[];
    get documentName(): "Actor";
    get id(): ID<TeriockActor>;
    get temporaryEffects(): ActiveEffectClass[];
    get token(): TeriockTokenDocument | null;
    get uuid(): UUID<TeriockActor>;
  }
}

declare global {
  export type TeriockActor<T extends ActorType = ActorType> = ActorClass & Subtype<ActorSystemMap, T>;
}

export {};
