import { Item } from "@client/documents/_module.mjs";
import { DocumentCollection } from "@client/documents/abstract/_module.mjs";

import { TeriockActiveEffect, TeriockItem } from "../_module.mjs";
import {
  ArmamentSheet,
  EquipmentSheet,
  MountSheet,
  PowerSheet,
  RankSheet,
  SpeciesSheet,
} from "../../applications/sheets/item-sheets/_module.mjs";
import { ChildSheet } from "../../applications/sheets/utility-sheets/_module.mjs";
import {
  ArchetypeSystem,
  BaseItemSystem,
  BodySystem,
  EquipmentSystem,
  MountSystem,
  PowerSystem,
  RankSystem,
  SpeciesSystem,
} from "../../data/systems/items/_module.mjs";

type ItemDocument = Teriock.Documents.DocumentBase<TeriockItem, Item> & {
  // @ts-expect-error Not a document
  effects: DocumentCollection<TeriockActiveEffect>;

  get transferredEffects(): TeriockActiveEffect[];
};

declare global {
  export type TeriockArchetype = Teriock.Documents.Subtype<ItemDocument, "archetype", ChildSheet, ArchetypeSystem>;
  export type TeriockBody = Teriock.Documents.Subtype<ItemDocument, "body", ArmamentSheet, BodySystem>;
  export type TeriockEquipment = Teriock.Documents.Subtype<ItemDocument, "equipment", EquipmentSheet, EquipmentSystem>;
  export type TeriockMount = Teriock.Documents.Subtype<ItemDocument, "mount", MountSheet, MountSystem>;
  export type TeriockPower = Teriock.Documents.Subtype<ItemDocument, "power", PowerSheet, PowerSystem>;
  export type TeriockRank = Teriock.Documents.Subtype<ItemDocument, "rank", RankSheet, RankSystem>;
  export type TeriockSpecies = Teriock.Documents.Subtype<ItemDocument, "species", SpeciesSheet, SpeciesSystem>;

  export interface ItemTypeMap {
    archetype: TeriockArchetype;
    body: TeriockBody;
    equipment: TeriockEquipment;
    mount: TeriockMount;
    power: TeriockPower;
    rank: TeriockRank;
    species: TeriockSpecies;
  }
}

declare global {
  namespace Teriock.Documents {
    export interface ItemInterface {
      _id: ID<AnyItem>;
      // @ts-expect-error Not a document
      effects: DocumentCollection<AnyActiveEffect>;
      parent?: AnyActor;
      system: BaseItemSystem;
      type: Teriock.Documents.ItemType;

      get actor(): AnyActor | null;

      get documentName(): "Item";

      get id(): ID<AnyItem>;

      get transferredEffects(): AnyActiveEffect[];

      get uuid(): UUID<AnyItem>;
    }
  }
}

export {};
