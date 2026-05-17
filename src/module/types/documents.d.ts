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
    _id: ID<TeriockCharacter>;
    sheet: CharacterSheet;
    system: CharacterSystem;
    type: "character";
    get id(): ID<TeriockCharacter>;
    get uuid(): UUID<TeriockCharacter>;
  };
  export type TeriockCreature = TeriockActor & {
    _id: ID<TeriockCreature>;
    sheet: CreatureSheet;
    system: CreatureSystem;
    type: "creature";
    get id(): ID<TeriockCreature>;
    get uuid(): UUID<TeriockCreature>;
  };
  export type TeriockInventory = TeriockActor & {
    _id: ID<TeriockInventory>;
    sheet: InventorySheet;
    system: InventorySystem;
    type: "inventory";
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
    _id: ID<TeriockArchetype>;
    sheet: ArchetypeSheet;
    system: ArchetypeSystem;
    type: "archetype";
    get id(): ID<TeriockArchetype>;
    get uuid(): UUID<TeriockArchetype>;
  };
  export type TeriockBody = TeriockItem & {
    _id: ID<TeriockBody>;
    sheet: BodySheet;
    system: BodySystem;
    type: "body";
    get id(): ID<TeriockBody>;
    get uuid(): UUID<TeriockBody>;
  };
  export type TeriockEquipment = TeriockItem & {
    _id: ID<TeriockEquipment>;
    sheet: EquipmentSheet;
    system: EquipmentSystem;
    type: "equipment";
    get id(): ID<TeriockEquipment>;
    get uuid(): UUID<TeriockEquipment>;
  };
  export type TeriockPower = TeriockItem & {
    _id: ID<TeriockPower>;
    sheet: PowerSheet;
    system: PowerSystem;
    type: "power";
    get id(): ID<TeriockPower>;
    get uuid(): UUID<TeriockPower>;
  };
  export type TeriockRank = TeriockItem & {
    _id: ID<TeriockRank>;
    sheet: RankSheet;
    system: RankSystem;
    type: "rank";
    get id(): ID<TeriockRank>;
    get uuid(): UUID<TeriockRank>;
  };
  export type TeriockSpecies = TeriockItem & {
    _id: ID<TeriockSpecies>;
    sheet: SpeciesSheet;
    system: SpeciesSystem;
    type: "species";
    get id(): ID<TeriockSpecies>;
    get uuid(): UUID<TeriockSpecies>;
  };
  export type TeriockMount = TeriockItem & {
    _id: ID<TeriockMount>;
    sheet: MountSheet;
    system: MountSystem;
    type: "mount";
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
    _id: ID<TeriockAbility>;
    sheet: AbilitySheet;
    system: AbilitySystem;
    type: "ability";
    get id(): ID<TeriockAbility>;
    get uuid(): UUID<TeriockAbility>;
  };
  export type TeriockAttunement = TeriockActiveEffect & {
    _id: ID<TeriockAttunement>;
    sheet: AttunementSheet;
    system: AttunementSystem;
    type: "attunement";
    get id(): ID<TeriockAttunement>;
    get uuid(): UUID<TeriockAttunement>;
  };
  export type TeriockCondition = TeriockActiveEffect & {
    _id: ID<TeriockCondition>;
    sheet: ConditionSheet;
    system: ConditionSystem;
    type: "condition";
    get id(): ID<TeriockCondition>;
    get uuid(): UUID<TeriockCondition>;
  };
  export type TeriockConsequence = TeriockActiveEffect & {
    _id: ID<TeriockConsequence>;
    sheet: ConsequenceSheet;
    system: ConsequenceSystem;
    type: "consequence";
    get id(): ID<TeriockConsequence>;
    get uuid(): UUID<TeriockConsequence>;
  };
  export type TeriockFluency = TeriockActiveEffect & {
    _id: ID<TeriockFluency>;
    sheet: FluencySheet;
    system: FluencySystem;
    type: "fluency";
    get id(): ID<TeriockFluency>;
    get uuid(): UUID<TeriockFluency>;
  };
  export type TeriockImbuement = TeriockActiveEffect & {
    _id: ID<TeriockImbuement>;
    sheet: ImbuementSheet;
    system: ImbuementSystem;
    type: "imbuement";
    get id(): ID<TeriockImbuement>;
    get uuid(): UUID<TeriockImbuement>;
  };
  export type TeriockProperty = TeriockActiveEffect & {
    _id: ID<TeriockProperty>;
    sheet: PropertySheet;
    system: PropertySystem;
    type: "property";
    get id(): ID<TeriockProperty>;
    get uuid(): UUID<TeriockProperty>;
  };
  export type TeriockResource = TeriockActiveEffect & {
    _id: ID<TeriockResource>;
    sheet: ResourceSheet;
    system: ResourceSystem;
    type: "resource";
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
    _id: ID<TeriockHarm>;
    sheet: HarmSheet;
    system: HarmSystem;
    type: "damage" | "drain";
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
