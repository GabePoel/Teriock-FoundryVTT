// noinspection JSUnusedGlobalSymbols

import "./helpers/commands/_types";
import "./data/_types";
import "./applications/_types";
import "./documents/_types";
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
} from "./documents/_module.mjs";
import PixiJS from "pixi.js";
import * as sheets from "./applications/sheets/_module.mjs";
import * as documents from "./documents/_documents.mjs";
import * as data from "./data/_module.mjs";
import * as placeables from "./canvas/placeables/_module.mjs";
import TeriockBaseActorSheet from "./applications/sheets/actor-sheets/base-actor-sheet/base-actor-sheet.mjs";
import TeriockBaseEffectSheet from "./applications/sheets/effect-sheets/base-effect-sheet/base-effect-sheet.mjs";
import TeriockBaseItemSheet from "./applications/sheets/item-sheets/base-item-sheet/base-item-sheet.mjs";
import TeriockBaseActorModel from "./data/actor-data/base-actor-model/base-actor-model.mjs";
import TeriockBaseEffectModel from "./data/effect-data/base-effect-model/base-effect-model.mjs";
import TeriockBaseItemModel from "./data/item-data/base-item-model/base-item-model.mjs";
import TeriockBaseMessageModel from "./data/message-data/base-message-model/base-message-model.mjs";

declare global {
  export import PIXI = PixiJS;

  const TERIOCK: typeof import("./constants/_module.mjs");

  // Base document classes
  // =====================

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

  // General document types
  // ======================

  export type TeriockParent = TeriockActor | TeriockItem;
  export type TeriockParentName = "Actor" | "Item";
  export type TeriockChild = TeriockItem | TeriockEffect;
  export type TeriockChildName = "Item" | "ActiveEffect";
  export type TeriockCommon = TeriockActor | TeriockItem | TeriockEffect;
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

  // Virtual document classes
  // ========================

  // Actor
  // -----

  const TeriockCharacter: documents.TeriockCharacter;
  const TeriockCreature: documents.TeriockCreature;

  // Item
  // ----

  const TeriockBody: documents.TeriockBody;
  const TeriockEquipment: documents.TeriockEquipment;
  const TeriockMount: documents.TeriockMount;
  const TeriockPower: documents.TeriockPower;
  const TeriockRank: documents.TeriockRank;
  const TeriockSpecies: documents.TeriockSpecies;
  const TeriockWrapper: documents.TeriockWrapper;

  // Effect
  // ------

  const TeriockAbility: documents.TeriockAbility;
  const TeriockAttunement: documents.TeriockAttunement;
  const TeriockConsequence: documents.TeriockConsequence;
  const TeriockCondition: documents.TeriockCondition;
  const TeriockFluency: documents.TeriockFluency;
  const TeriockProperty: documents.TeriockProperty;
  const TeriockResource: documents.TeriockResource;

  // Data Models
  // ===========

  // Base Data Models
  // ----------------

  const TeriockBaseActorModel: TeriockBaseActorModel;
  const TeriockBaseItemModel: TeriockBaseItemModel;
  const TeriockBaseEffectModel: TeriockBaseEffectModel;
  const TeriockBaseMessageModel: TeriockBaseMessageModel;

  // Actor
  // -----

  const TeriockCharacterModel: data.actor.TeriockCharacterModel;

  // Item
  // ----

  const TeriockBodyModel: data.item.TeriockBodyModel;
  const TeriockEquipmentModel: data.item.TeriockEquipmentModel;
  const TeriockMountModel: data.item.TeriockMountModel;
  const TeriockPowerModel: data.item.TeriockPowerModel;
  const TeriockRankModel: data.item.TeriockRankModel;
  const TeriockSpeciesModel: data.item.TeriockSpeciesModel;
  const TeriockWrapperModel: data.item.TeriockWrapperModel;

  // Effect
  // ------

  const TeriockAbilityModel: data.effect.TeriockAbilityModel;
  const TeriockAttunementModel: data.effect.TeriockAttunementModel;
  const TeriockConsequenceModel: data.effect.TeriockConsequenceModel;
  const TeriockConditionModel: data.effect.TeriockConditionModel;
  const TeriockFluencyModel: data.effect.TeriockFluencyModel;
  const TeriockPropertyModel: data.effect.TeriockPropertyModel;
  const TeriockResourceModel: data.effect.TeriockResourceModel;

  // Sheets
  // ======

  // Base Sheets
  // -----------

  const TeriockBaseActorSheet: TeriockBaseActorSheet;
  const TeriockBaseItemSheet: TeriockBaseItemSheet;
  const TeriockBaseEffectSheet: TeriockBaseEffectSheet;

  // Actor
  // -----

  const TeriockCharacterSheet: sheets.actor.TeriockCharacterSheet;
  const TeriockCreatureSheet: sheets.actor.TeriockCreatureSheet;

  // Item
  // ----

  const TeriockBodySheet: sheets.item.TeriockBodySheet;
  const TeriockEquipmentSheet: sheets.item.TeriockEquipmentSheet;
  const TeriockMountSheet: sheets.item.TeriockMountSheet;
  const TeriockPowerSheet: sheets.item.TeriockPowerSheet;
  const TeriockRankSheet: sheets.item.TeriockRankSheet;
  const TeriockSpeciesSheet: sheets.item.TeriockSpeciesSheet;
  const TeriockWrapperSheet: sheets.item.TeriockWrapperSheet;

  // Effect
  // ------

  const TeriockAbilitySheet: sheets.effect.TeriockAbilitySheet;
  const TeriockAttunementSheet: sheets.effect.TeriockAttunementSheet;
  const TeriockConsequenceSheet: sheets.effect.TeriockConsequenceSheet;
  const TeriockConditionSheet: sheets.effect.TeriockConditionSheet;
  const TeriockFluencySheet: sheets.effect.TeriockFluencySheet;
  const TeriockPropertySheet: sheets.effect.TeriockPropertySheet;
  const TeriockResourceSheet: sheets.effect.TeriockResourceSheet;

  // Placeables
  // ==========

  const TeriockToken: placeables.TeriockToken;

  namespace Teriock {
    const __brand: unique symbol;

    /** FoundryVTT UUID */
    type UUID<T = unknown> = string & {
      [__brand]: T;
    };

    // noinspection JSClassNamingConvention
    /** FoundryVTT ID */
    type ID<T = unknown> = string & {
      [__brand]: T;
    };
    /** Safe Teriock UUID */
    type SafeUUID<T = unknown> = string & {
      [__brand]: T;
    };
  }
}

export {};
