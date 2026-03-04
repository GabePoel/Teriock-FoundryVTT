// noinspection JSUnusedGlobalSymbols

import {
  AbilitySystem,
  AttunementSystem,
  ConditionSystem,
  ConsequenceSystem,
  FluencySystem,
  PropertySystem,
  ResourceSystem,
} from "../data/systems/effects/_module.mjs";
import {
  AbilitySheet,
  AttunementSheet,
  ConditionSheet,
  ConsequenceSheet,
  FluencySheet,
  PropertySheet,
  ResourceSheet,
} from "../applications/sheets/effect-sheets/_module.mjs";
import {
  TeriockActiveEffect,
  TeriockActor,
  TeriockChatMessage,
  TeriockCombat,
  TeriockFolder,
  TeriockItem,
  TeriockJournalEntry,
  TeriockJournalEntryCategory,
  TeriockJournalEntryPage,
  TeriockMacro,
  TeriockScene,
  TeriockTokenDocument,
  TeriockUser,
} from "../documents/_module.mjs";
import {
  BodySheet,
  EquipmentSheet,
  MountSheet,
  PowerSheet,
  RankSheet,
  SpeciesSheet,
  WrapperSheet,
} from "../applications/sheets/item-sheets/_module.mjs";
import {
  BodySystem,
  EquipmentSystem,
  MountSystem,
  PowerSystem,
  RankSystem,
  SpeciesSystem,
  WrapperSystem,
} from "../data/systems/items/_module.mjs";
import {
  CharacterSheet,
  CreatureSheet,
} from "../applications/sheets/actor-sheets/_module.mjs";
import {
  CharacterSystem,
  CreatureSystem,
} from "../data/systems/actors/_module.mjs";

// Base Document Classes
// =====================

declare global {
  const TeriockActor: TeriockActor;
  const TeriockChatMessage: TeriockChatMessage;
  const TeriockCombat: TeriockCombat;
  const TeriockActiveEffect: TeriockActiveEffect;
  const TeriockFolder: TeriockFolder;
  const TeriockItem: TeriockItem;
  const TeriockJournalEntry: TeriockJournalEntry;
  const TeriockJournalEntryCategory: TeriockJournalEntryCategory;
  const TeriockJournalEntryPage: TeriockJournalEntryPage;
  const TeriockMacro: TeriockMacro;
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
}

// Items
// =====

declare global {
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
  export type TeriockWrapper = TeriockItem & {
    sheet: WrapperSheet;
    system: WrapperSystem;
    type: "wrapper";
    _id: ID<TeriockWrapper>;
    get id(): ID<TeriockWrapper>;
    get uuid(): UUID<TeriockWrapper>;
  };
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
  export type TeriockProperty = TeriockActiveEffect & {
    sheet: PropertySheet;
    system: PropertySystem;
    type: "property";
    _id: ID<TeriockProperty>;
    get id(): ID<TeriockProperty>;
    get uuid(): UUID<TeriockProperty>;
    parent: TeriockEquipment;
  };
  export type TeriockResource = TeriockActiveEffect & {
    sheet: ResourceSheet;
    system: ResourceSystem;
    type: "resource";
    _id: ID<TeriockResource>;
    get id(): ID<TeriockResource>;
    get uuid(): UUID<TeriockResource>;
  };
}

// Specific Unions
// ===============

declare global {
  export type AnyActiveEffect =
    | TeriockAbility
    | TeriockAttunement
    | TeriockCondition
    | TeriockConsequence
    | TeriockFluency
    | TeriockProperty
    | TeriockResource;
  export type AnyItem =
    | TeriockBody
    | TeriockEquipment
    | TeriockPower
    | TeriockRank
    | TeriockSpecies
    | TeriockMount
    | TeriockWrapper;
  export type AnyActor = TeriockCharacter | TeriockCreature;
  export type AnyParent = AnyActor | AnyItem;
  export type AnyCommonDocument = AnyActor | AnyItem | AnyActiveEffect;
  export type AnyChildDocument = AnyItem | AnyActiveEffect;
  export type AnyRules = AnyCommonDocument | TeriockJournalEntryPage;
  export type TeriockArmament = TeriockBody | TeriockEquipment;
  export type TeriockLingering = TeriockCondition | TeriockConsequence;
}

// General Unions
// ==============

declare global {
  export type ParentDocument = TeriockActor | TeriockItem;
  export type ParentDocumentName = "Actor" | "Item";
  export type ChildDocument = TeriockItem | TeriockActiveEffect;
  export type ChildDocumentName = "Item" | "ActiveEffect";
  export type CommonDocument = TeriockActor | TeriockItem | TeriockActiveEffect;
  export type CommonDocumentName = "Actor" | "Item" | "ActiveEffect";
  export type TeriockDocument =
    | TeriockActor
    | TeriockChatMessage
    | TeriockCombat
    | TeriockActiveEffect
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
