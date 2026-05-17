// noinspection JSUnusedGlobalSymbols

import { CharacterSheet, CreatureSheet, InventorySheet } from "../applications/sheets/actor-sheets/_module.mjs";
import {
  AbilitySheet,
  AttunementSheet,
  ConditionSheet,
  ConsequenceSheet,
  FluencySheet,
  ImbuementSheet,
  PropertySheet,
  ResourceSheet,
} from "../applications/sheets/effect-sheets/_module.mjs";
import {
  ArchetypeSheet,
  BodySheet,
  EquipmentSheet,
  MountSheet,
  PowerSheet,
  RankSheet,
  SpeciesSheet,
} from "../applications/sheets/item-sheets/_module.mjs";
import { HarmSheet } from "../applications/sheets/page-sheets/_module.mjs";
import { CharacterSystem, CreatureSystem, InventorySystem } from "../data/systems/actors/_module.mjs";
import {
  AbilitySystem,
  AttunementSystem,
  ConditionSystem,
  ConsequenceSystem,
  FluencySystem,
  ImbuementSystem,
  PropertySystem,
  ResourceSystem,
} from "../data/systems/effects/_module.mjs";
import {
  ArchetypeSystem,
  BodySystem,
  EquipmentSystem,
  MountSystem,
  PowerSystem,
  RankSystem,
  SpeciesSystem,
} from "../data/systems/items/_module.mjs";
import { HarmSystem } from "../data/systems/pages/_module.mjs";
import {
  TeriockActiveEffect,
  TeriockActor,
  TeriockCard,
  TeriockChatMessage,
  TeriockCombat,
  TeriockFolder,
  TeriockItem,
  TeriockJournalEntry,
  TeriockJournalEntryCategory,
  TeriockJournalEntryPage,
  TeriockMacro,
  TeriockRegionDocument,
  TeriockScene,
  TeriockTokenDocument,
  TeriockUser,
} from "../documents/_module.mjs";

// Base Document Classes
// =====================

declare global {
  const TeriockActiveEffect: TeriockActiveEffect;
  const TeriockActor: TeriockActor;
  const TeriockCard: TeriockCard;
  const TeriockChatMessage: TeriockChatMessage;
  const TeriockCombat: TeriockCombat;
  const TeriockFolder: TeriockFolder;
  const TeriockItem: TeriockItem;
  const TeriockJournalEntry: TeriockJournalEntry;
  const TeriockJournalEntryCategory: TeriockJournalEntryCategory;
  const TeriockJournalEntryPage: TeriockJournalEntryPage;
  const TeriockMacro: TeriockMacro;
  const TeriockRegionDocument: TeriockRegionDocument;
  const TeriockScene: TeriockScene;
  const TeriockTokenDocument: TeriockTokenDocument;
  const TeriockUser: TeriockUser;
}

// Actors
// ======

declare global {
  export type TeriockCharacter = TeriockActor & {
    sheet: CharacterSheet;
    system: CharacterSystem;
    type: "character";
    _id: ID<TeriockCharacter>;
    get id(): ID<TeriockCharacter>;
    get uuid(): UUID<TeriockCharacter>;
  };
  export type TeriockCreature = TeriockActor & {
    sheet: CreatureSheet;
    system: CreatureSystem;
    type: "creature";
    _id: ID<TeriockCreature>;
    get id(): ID<TeriockCreature>;
    get uuid(): UUID<TeriockCreature>;
  };
  export type TeriockInventory = TeriockActor & {
    sheet: InventorySheet;
    system: InventorySystem;
    type: "inventory";
    _id: ID<TeriockInventory>;
    get id(): ID<TeriockInventory>;
    get uuid(): UUID<TeriockInventory>;
  };

  export interface ActorTypeMap {
    character: TeriockCharacter;
    creature: TeriockCreature;
    inventory: TeriockInventory;
  }
}

// Items
// =====

declare global {
  export type TeriockArchetype = TeriockItem & {
    sheet: ArchetypeSheet;
    system: ArchetypeSystem;
    type: "archetype";
    _id: ID<TeriockArchetype>;
    get id(): ID<TeriockArchetype>;
    get uuid(): UUID<TeriockArchetype>;
  };
  export type TeriockBody = TeriockItem & {
    sheet: BodySheet;
    system: BodySystem;
    type: "body";
    _id: ID<TeriockBody>;
    get id(): ID<TeriockBody>;
    get uuid(): UUID<TeriockBody>;
  };
  export type TeriockEquipment = TeriockItem & {
    sheet: EquipmentSheet;
    system: EquipmentSystem;
    type: "equipment";
    _id: ID<TeriockEquipment>;
    get id(): ID<TeriockEquipment>;
    get uuid(): UUID<TeriockEquipment>;
  };
  export type TeriockPower = TeriockItem & {
    sheet: PowerSheet;
    system: PowerSystem;
    type: "power";
    _id: ID<TeriockPower>;
    get id(): ID<TeriockPower>;
    get uuid(): UUID<TeriockPower>;
  };
  export type TeriockRank = TeriockItem & {
    sheet: RankSheet;
    system: RankSystem;
    type: "rank";
    _id: ID<TeriockRank>;
    get id(): ID<TeriockRank>;
    get uuid(): UUID<TeriockRank>;
  };
  export type TeriockSpecies = TeriockItem & {
    sheet: SpeciesSheet;
    system: SpeciesSystem;
    type: "species";
    _id: ID<TeriockSpecies>;
    get id(): ID<TeriockSpecies>;
    get uuid(): UUID<TeriockSpecies>;
  };
  export type TeriockMount = TeriockItem & {
    sheet: MountSheet;
    system: MountSystem;
    type: "mount";
    _id: ID<TeriockMount>;
    get id(): ID<TeriockMount>;
    get uuid(): UUID<TeriockMount>;
  };

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

// Effects
// =======

declare global {
  export type TeriockAbility = TeriockActiveEffect & {
    sheet: AbilitySheet;
    system: AbilitySystem;
    type: "ability";
    _id: ID<TeriockAbility>;
    get id(): ID<TeriockAbility>;
    get uuid(): UUID<TeriockAbility>;
  };
  export type TeriockAttunement = TeriockActiveEffect & {
    sheet: AttunementSheet;
    system: AttunementSystem;
    type: "attunement";
    _id: ID<TeriockAttunement>;
    get id(): ID<TeriockAttunement>;
    get uuid(): UUID<TeriockAttunement>;
  };
  export type TeriockCondition = TeriockActiveEffect & {
    sheet: ConditionSheet;
    system: ConditionSystem;
    type: "condition";
    _id: ID<TeriockCondition>;
    get id(): ID<TeriockCondition>;
    get uuid(): UUID<TeriockCondition>;
  };
  export type TeriockConsequence = TeriockActiveEffect & {
    sheet: ConsequenceSheet;
    system: ConsequenceSystem;
    type: "consequence";
    _id: ID<TeriockConsequence>;
    get id(): ID<TeriockConsequence>;
    get uuid(): UUID<TeriockConsequence>;
  };
  export type TeriockFluency = TeriockActiveEffect & {
    sheet: FluencySheet;
    system: FluencySystem;
    type: "fluency";
    _id: ID<TeriockFluency>;
    get id(): ID<TeriockFluency>;
    get uuid(): UUID<TeriockFluency>;
  };
  export type TeriockImbuement = TeriockActiveEffect & {
    sheet: ImbuementSheet;
    system: ImbuementSystem;
    type: "imbuement";
    _id: ID<TeriockImbuement>;
    get id(): ID<TeriockImbuement>;
    get uuid(): UUID<TeriockImbuement>;
  };
  export type TeriockProperty = TeriockActiveEffect & {
    sheet: PropertySheet;
    system: PropertySystem;
    type: "property";
    _id: ID<TeriockProperty>;
    get id(): ID<TeriockProperty>;
    get uuid(): UUID<TeriockProperty>;
  };
  export type TeriockResource = TeriockActiveEffect & {
    sheet: ResourceSheet;
    system: ResourceSystem;
    type: "resource";
    _id: ID<TeriockResource>;
    get id(): ID<TeriockResource>;
    get uuid(): UUID<TeriockResource>;
  };

  export interface ActiveEffectTypeMap {
    ability: TeriockAbility;
    attunement: TeriockAttunement;
    condition: TeriockCondition;
    consequence: TeriockConsequence;
    fluency: TeriockFluency;
    imbuement: TeriockImbuement;
    property: TeriockProperty;
    resource: TeriockResource;
  }
}

// Journal Entry Pages
declare global {
  export type TeriockHarm = TeriockJournalEntryPage & {
    sheet: HarmSheet;
    system: HarmSystem;
    type: "damage" | "drain";
    _id: ID<TeriockHarm>;
    get id(): ID<TeriockHarm>;
    get uuid(): UUID<TeriockHarm>;
  };
}

// Specific Unions
// ===============

declare global {
  export type AnyActiveEffect = ActiveEffectTypeMap[keyof ActiveEffectTypeMap];
  export type AnyItem = ItemTypeMap[keyof ItemTypeMap];
  export type AnyActor = ActorTypeMap[keyof ActorTypeMap];
  export type AnyParent = AnyActor | AnyItem;
  export type AnyCommonDocument = AnyActiveEffect | AnyActor | AnyItem;
  export type AnyChildDocument = AnyActiveEffect | AnyItem;
  export type AnyRules = AnyCommonDocument | TeriockJournalEntryPage;
  export type TeriockArmament = TeriockBody | TeriockEquipment;
  export type TeriockLingering = TeriockCondition | TeriockConsequence;
}

// General Unions
// ==============

declare global {
  export type ParentDocument = TeriockActor | TeriockItem;
  export type ParentDocumentName = "Actor" | "Item";
  export type ChildDocument = TeriockActiveEffect | TeriockItem;
  export type ChildDocumentName = "ActiveEffect" | "Item";
  export type CommonDocument = TeriockActiveEffect | TeriockActor | TeriockItem;
  export type CommonDocumentName = "ActiveEffect" | "Actor" | "Item";
  export type TeriockDocument =
    | TeriockActiveEffect
    | TeriockActor
    | TeriockChatMessage
    | TeriockCombat
    | TeriockFolder
    | TeriockItem
    | TeriockJournalEntry
    | TeriockJournalEntryCategory
    | TeriockJournalEntryPage
    | TeriockMacro
    | TeriockScene
    | TeriockTokenDocument
    | TeriockUser;
}
