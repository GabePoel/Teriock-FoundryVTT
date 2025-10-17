import "./helpers/commands/_types";
import "./data/_types";
import "./applications/_types";
import "./documents/_types";
import type {
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
import { TeriockBody, TeriockEquipment } from "./documents/_documents.mjs";
import * as data from "./data/_module.mjs";
import * as placeables from "./canvas/placeables/_module.mjs";
import * as collections from "./documents/_collections.mjs";
import type TeriockBaseActorSheet from "./applications/sheets/actor-sheets/base-actor-sheet/base-actor-sheet.mjs";
import type TeriockBaseEffectSheet from "./applications/sheets/effect-sheets/base-effect-sheet/base-effect-sheet.mjs";
import type TeriockBaseItemSheet from "./applications/sheets/item-sheets/base-item-sheet/base-item-sheet.mjs";
import type TeriockBaseActorModel from "./data/actor-data/base-actor-data/base-actor-data.mjs";
import type TeriockBaseEffectModel from "./data/effect-data/base-effect-data/base-effect-data.mjs";
import type TeriockBaseItemModel from "./data/item-data/base-item-data/base-item-data.mjs";
import type TeriockBaseMessageModel from "./data/message-data/base-message-data/base-message-data.mjs";

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
  export type TeriockChild = TeriockItem | TeriockEffect;
  export type TeriockCommon = TeriockActor | TeriockItem | TeriockEffect;
  export type TeriockArmament = TeriockEquipment | TeriockBody;

  // Virtual document classes
  // ========================

  // Actor
  // -----

  const TeriockCharacter: documents.TeriockCharacter;

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

  // Compendium collections
  // ----------------------

  const TeriockBodyCompendium: collections.TeriockBodyCompendium;
  const TeriockCharacterCompendium: collections.TeriockCharacterCompendium;
  const TeriockCompendiumCollection: collections.TeriockCompendiumCollection;
  const TeriockEquipmentCompendium: collections.TeriockEquipmentCompendium;
  const TeriockMacroCompendium: collections.TeriockMacroCompendium;
  const TeriockPowerCompendium: collections.TeriockPowerCompendium;
  const TeriockRankCompendium: collections.TeriockRankCompendium;
  const TeriockSpeciesCompendium: collections.TeriockSpeciesCompendium;
  const TeriockWrapperCompendium: collections.TeriockWrapperCompendium;

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

  const TeriockCharacterSheet: sheets.actor.CharacterSheet;

  // Item
  // ----

  const TeriockBodySheet: sheets.item.BodySheet;
  const TeriockEquipmentSheet: sheets.item.EquipmentSheet;
  const TeriockMountSheet: sheets.item.MountSheet;
  const TeriockPowerSheet: sheets.item.PowerSheet;
  const TeriockRankSheet: sheets.item.RankSheet;
  const TeriockSpeciesSheet: sheets.item.SpeciesSheet;
  const TeriockWrapperSheet: sheets.item.WrapperSheet;

  // Effect
  // ------

  const TeriockAbilitySheet: sheets.effect.AbilitySheet;
  const TeriockAttunementSheet: sheets.effect.AttunementSheet;
  const TeriockConsequenceSheet: sheets.effect.ConsequenceSheet;
  const TeriockConditionSheet: sheets.effect.ConditionSheet;
  const TeriockFluencySheet: sheets.effect.FluencySheet;
  const TeriockPropertySheet: sheets.effect.PropertySheet;
  const TeriockResourceSheet: sheets.effect.ResourceSheet;

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
