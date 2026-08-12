import { Actor } from "@client/documents/_module.mjs";
import { DocumentCollection } from "@client/documents/abstract/_module.mjs";

import { TeriockActiveEffect, TeriockActor, TeriockItem, TeriockTokenDocument } from "../_module.mjs";
import { BaseActorSheet, InventorySheet, PlayableActorSheet } from "../../applications/sheets/actor-sheets/_module.mjs";
import {
  BaseActorSystem,
  CharacterSystem,
  CreatureSystem,
  InventorySystem,
} from "../../data/systems/actors/_module.mjs";

type ActorDocument = Omit<Teriock.Documents.DocumentBase<TeriockActor, Actor>, "documentName"> & {
  // @ts-expect-error DocumentConstructionContext
  effects: DocumentCollection<TeriockActiveEffect>;
  // @ts-expect-error DocumentConstructionContext
  items: DocumentCollection<TeriockItem>;

  get documentName(): "Actor";
};

declare module "./actor.mjs" {
  export default interface TeriockActor {
    _id: ID<AnyActor>;
    // @ts-expect-error DocumentConstructionContext
    effects: DocumentCollection<AnyActiveEffect>;
    // @ts-expect-error DocumentConstructionContext
    items: DocumentCollection<AnyItem>;
    sheet: BaseActorSheet;
    statuses: Set<Teriock.Keys.Condition>;
    system: BaseActorSystem;

    get actor(): AnyActor;

    get appliedEffects(): AnyActiveEffect[];

    get documentName(): "Actor";

    get id(): ID<AnyActor>;

    get temporaryEffects(): TeriockActiveEffect[];

    get token(): TeriockTokenDocument | null;

    get uuid(): UUID<AnyActor>;
  }
}

declare global {
  export interface TeriockCharacter
    extends Teriock.Documents.Subtype<ActorDocument, "character", PlayableActorSheet, CharacterSystem>
  {}
  export interface TeriockCreature
    extends Teriock.Documents.Subtype<ActorDocument, "creature", PlayableActorSheet, CreatureSystem>
  {}
  export interface TeriockInventory
    extends Teriock.Documents.Subtype<ActorDocument, "inventory", InventorySheet, InventorySystem>
  {}

  export interface ActorTypeMap {
    character: TeriockCharacter;
    creature: TeriockCreature;
    inventory: TeriockInventory;
  }
}

export {};
