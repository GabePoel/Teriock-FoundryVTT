// noinspection JSUnusedGlobalSymbols

import {
  TeriockAbilityModel,
  TeriockAttunementModel,
  TeriockConditionModel,
  TeriockConsequenceModel,
  TeriockFluencyModel,
  TeriockPropertyModel,
  TeriockResourceModel,
} from "../data/effect-data/_module.mjs";
import {
  TeriockAbilitySheet,
  TeriockAttunementSheet,
  TeriockConditionSheet,
  TeriockConsequenceSheet,
  TeriockFluencySheet,
  TeriockPropertySheet,
  TeriockResourceSheet,
} from "../applications/sheets/effect-sheets/_module.mjs";
import {
  TeriockActor,
  TeriockChatMessage,
  TeriockCombat,
  TeriockEffect,
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
  TeriockBodySheet,
  TeriockEquipmentSheet,
  TeriockMountSheet,
  TeriockPowerSheet,
  TeriockRankSheet,
  TeriockSpeciesSheet,
  TeriockWrapperSheet,
} from "../applications/sheets/item-sheets/_module.mjs";
import {
  TeriockBodyModel,
  TeriockEquipmentModel,
  TeriockMountModel,
  TeriockPowerModel,
  TeriockRankModel,
  TeriockSpeciesModel,
  TeriockWrapperModel,
} from "../data/item-data/_module.mjs";
import {
  TeriockCharacterSheet,
  TeriockCreatureSheet,
} from "../applications/sheets/actor-sheets/_module.mjs";
import {
  TeriockCharacterModel,
  TeriockCreatureModel,
} from "../data/actor-data/_module.mjs";

// Base Document Classes
// =====================

declare global {
  const TeriockActor: TeriockActor;
  const TeriockChatMessage: TeriockChatMessage;
  const TeriockCombat: TeriockCombat;
  const TeriockEffect: TeriockEffect;
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
    sheet: TeriockCharacterSheet;
    system: TeriockCharacterModel;
    type: "character";
    _id: ID<TeriockCharacter>;
    get id(): ID<TeriockCharacter>;
    get uuid(): UUID<TeriockCharacter>;
  };
  export type TeriockCreature = TeriockActor & {
    sheet: TeriockCreatureSheet;
    system: TeriockCreatureModel;
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
    sheet: TeriockBodySheet;
    system: TeriockBodyModel;
    type: "body";
    _id: ID<TeriockBody>;
    get id(): ID<TeriockBody>;
    get uuid(): UUID<TeriockBody>;
  };
  export type TeriockEquipment = TeriockItem & {
    sheet: TeriockEquipmentSheet;
    system: TeriockEquipmentModel;
    type: "equipment";
    _id: ID<TeriockEquipment>;
    get id(): ID<TeriockEquipment>;
    get uuid(): UUID<TeriockEquipment>;
  };
  export type TeriockPower = TeriockItem & {
    sheet: TeriockPowerSheet;
    system: TeriockPowerModel;
    type: "power";
    _id: ID<TeriockPower>;
    get id(): ID<TeriockPower>;
    get uuid(): UUID<TeriockPower>;
  };
  export type TeriockRank = TeriockItem & {
    sheet: TeriockRankSheet;
    system: TeriockRankModel;
    type: "rank";
    _id: ID<TeriockRank>;
    get id(): ID<TeriockRank>;
    get uuid(): UUID<TeriockRank>;
  };
  export type TeriockSpecies = TeriockItem & {
    sheet: TeriockSpeciesSheet;
    system: TeriockSpeciesModel;
    type: "species";
    _id: ID<TeriockSpecies>;
    get id(): ID<TeriockSpecies>;
    get uuid(): UUID<TeriockSpecies>;
  };
  export type TeriockMount = TeriockItem & {
    sheet: TeriockMountSheet;
    system: TeriockMountModel;
    type: "mount";
    _id: ID<TeriockMount>;
    get id(): ID<TeriockMount>;
    get uuid(): UUID<TeriockMount>;
  };
  export type TeriockWrapper = TeriockItem & {
    sheet: TeriockWrapperSheet;
    system: TeriockWrapperModel;
    type: "wrapper";
    _id: ID<TeriockWrapper>;
    get id(): ID<TeriockWrapper>;
    get uuid(): UUID<TeriockWrapper>;
  };
}

// Effects
// =======

declare global {
  export type TeriockAbility = TeriockEffect & {
    sheet: TeriockAbilitySheet;
    system: TeriockAbilityModel;
    type: "ability";
    _id: ID<TeriockAbility>;
    get id(): ID<TeriockAbility>;
    get uuid(): UUID<TeriockAbility>;
  };
  export type TeriockAttunement = TeriockEffect & {
    sheet: TeriockAttunementSheet;
    system: TeriockAttunementModel;
    type: "attunement";
    _id: ID<TeriockAttunement>;
    get id(): ID<TeriockAttunement>;
    get uuid(): UUID<TeriockAttunement>;
  };
  export type TeriockCondition = TeriockEffect & {
    sheet: TeriockConditionSheet;
    system: TeriockConditionModel;
    type: "condition";
    _id: ID<TeriockCondition>;
    get id(): ID<TeriockCondition>;
    get uuid(): UUID<TeriockCondition>;
  };
  export type TeriockConsequence = TeriockEffect & {
    sheet: TeriockConsequenceSheet;
    system: TeriockConsequenceModel;
    type: "consequence";
    _id: ID<TeriockConsequence>;
    get id(): ID<TeriockConsequence>;
    get uuid(): UUID<TeriockConsequence>;
  };
  export type TeriockFluency = TeriockEffect & {
    sheet: TeriockFluencySheet;
    system: TeriockFluencyModel;
    type: "fluency";
    _id: ID<TeriockFluency>;
    get id(): ID<TeriockFluency>;
    get uuid(): UUID<TeriockFluency>;
  };
  export type TeriockProperty = TeriockEffect & {
    sheet: TeriockPropertySheet;
    system: TeriockPropertyModel;
    type: "property";
    _id: ID<TeriockProperty>;
    get id(): ID<TeriockProperty>;
    get uuid(): UUID<TeriockProperty>;
    get parent(): TeriockEquipment;
  };
  export type TeriockResource = TeriockEffect & {
    sheet: TeriockResourceSheet;
    system: TeriockResourceModel;
    type: "resource";
    _id: ID<TeriockResource>;
    get id(): ID<TeriockResource>;
    get uuid(): UUID<TeriockResource>;
  };
}

// Specific Unions
// ===============

declare global {
  export type TeriockArmament = TeriockBody | TeriockEquipment;
  export type TeriockLingering = TeriockCondition | TeriockConsequence;
}

// General Unions
// ==============

declare global {
  export type TeriockParent = TeriockActor | TeriockItem;
  export type TeriockParentName = "Actor" | "Item";
  export type TeriockChild = TeriockItem | TeriockEffect;
  export type TeriockChildName = "Item" | "ActiveEffect";
  export type TeriockCommon = TeriockActor | TeriockItem | TeriockEffect;
  export type TeriockCommonName = "Actor" | "Item" | "ActiveEffect";
  export type TeriockDocument =
    | TeriockActor
    | TeriockChatMessage
    | TeriockCombat
    | TeriockEffect
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
