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

type ItemDocument = Omit<Teriock.Documents.DocumentBase<TeriockItem, Item>, "documentName"> & {
  // @ts-expect-error Not a document
  effects: DocumentCollection<TeriockActiveEffect>;

  get documentName(): "Item";

  get transferredEffects(): TeriockActiveEffect[];
};

declare module "./item.mjs" {
  export default interface TeriockItem {
    _id: ID<AnyItem>;
    // @ts-expect-error Not a document
    effects: DocumentCollection<AnyActiveEffect>;
    system: BaseItemSystem;
    type: Teriock.Documents.ItemType;

    get actor(): AnyActor | null;

    get documentName(): "Item";

    get id(): ID<AnyItem>;

    get transferredEffects(): AnyActiveEffect[];

    get uuid(): UUID<AnyItem>;
  }
}

declare global {
  export interface TeriockArchetype
    extends Teriock.Documents.Subtype<ItemDocument, "archetype", ChildSheet, ArchetypeSystem>
  {}
  export interface TeriockBody extends Teriock.Documents.Subtype<ItemDocument, "body", ArmamentSheet, BodySystem> {}
  export interface TeriockEquipment
    extends Teriock.Documents.Subtype<ItemDocument, "equipment", EquipmentSheet, EquipmentSystem>
  {}
  export interface TeriockMount extends Teriock.Documents.Subtype<ItemDocument, "mount", MountSheet, MountSystem> {}
  export interface TeriockPower extends Teriock.Documents.Subtype<ItemDocument, "power", PowerSheet, PowerSystem> {}
  export interface TeriockRank extends Teriock.Documents.Subtype<ItemDocument, "rank", RankSheet, RankSystem> {}
  export interface TeriockSpecies
    extends Teriock.Documents.Subtype<ItemDocument, "species", SpeciesSheet, SpeciesSystem>
  {}

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

export {};
