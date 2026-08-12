import { Actor } from "@client/documents/_module.mjs";
import { DocumentCollection } from "@client/documents/abstract/_module.mjs";

import { TeriockActor as ActorClass, TeriockTokenDocument } from "../_module.mjs";
import { BaseActorSheet } from "../../applications/sheets/actor-sheets/_module.mjs";
import { BaseActorSystem } from "../../data/systems/actors/_module.mjs";

type ActorDocument = Omit<Teriock.Documents.DocumentBase<ActorClass, Actor>, "documentName"> & {
  // @ts-expect-error DocumentConstructionContext
  effects: DocumentCollection<TeriockActiveEffect>;
  // @ts-expect-error DocumentConstructionContext
  items: DocumentCollection<TeriockItem>;

  get documentName(): "Actor";
};

interface ActorSubtype<T extends ActorType>
  extends Teriock.Documents.Subtype<ActorDocument, T, ActorSheetMap[T], ActorSystemMap[T]>
{}

declare module "./actor.mjs" {
  export default interface TeriockActor {
    _id: ID<TeriockActor>;
    // @ts-expect-error DocumentConstructionContext
    effects: DocumentCollection<TeriockActiveEffect>;
    // @ts-expect-error DocumentConstructionContext
    items: DocumentCollection<TeriockItem>;
    sheet: BaseActorSheet;
    statuses: Set<Teriock.Keys.Condition>;
    system: BaseActorSystem;

    get appliedEffects(): TeriockActiveEffect[];

    get documentName(): "Actor";

    get id(): ID<TeriockActor>;

    get temporaryEffects(): TeriockActiveEffect[];

    get token(): TeriockTokenDocument | null;

    get uuid(): UUID<TeriockActor>;
  }
}

declare global {
  export type TeriockActor<T extends ActorType = ActorType> = T extends unknown ? ActorSubtype<T> : never;
}

export {};
