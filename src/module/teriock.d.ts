import "./helpers/commands/_types";
import "./data/_types";
import "./applications/_types";
import "./documents/_types";

declare global {
  // Base document classes
  // =====================

  const TeriockActor: typeof import("./documents/actor.mjs").default;
  const TeriockChatMessage: typeof import("./documents/chat-message.mjs").default;
  const TeriockCompendiumCollection: typeof import("./documents/collections/compendium-collection.mjs").default;
  const TeriockCompendiumFolderCollection: typeof import("./documents/collections/compendium-folder-collection.mjs").default;
  const TeriockEffect: typeof import("./documents/effect.mjs").default;
  const TeriockItem: typeof import("./documents/item.mjs").default;
  const TeriockMacro: typeof import("./documents/macro.mjs").default;
  const TeriockScene: typeof import("./documents/scene.mjs").default;
  const TeriockTokenDocument: typeof import("./documents/token-document.mjs").default;
  const TeriockUser: typeof import("./documents/user.mjs").default;
  const TeriockWorldCollection: typeof import("./documents/collections/world-collection.mjs").default;

  // Virtual document classes
  // ========================

  // Actor
  // -----

  const TeriockCharacter: typeof import("./documents/_documents.mjs").TeriockCharacter;

  // Item
  // ----

  const TeriockEquipment: typeof import("./documents/_documents.mjs").TeriockEquipment;
  const TeriockPower: typeof import("./documents/_documents.mjs").TeriockPower;
  const TeriockRank: typeof import("./documents/_documents.mjs").TeriockRank;
  const TeriockSpecies: typeof import("./documents/_documents.mjs").TeriockSpecies;

  // Effect
  // ------

  const TeriockAbility: typeof import("./documents/_documents.mjs").TeriockAbility;
  const TeriockAttunement: typeof import("./documents/_documents.mjs").TeriockAttunement;
  const TeriockConsequence: typeof import("./documents/_documents.mjs").TeriockConsequence;
  const TeriockCondition: typeof import("./documents/_documents.mjs").TeriockCondition;
  const TeriockFluency: typeof import("./documents/_documents.mjs").TeriockFluency;
  const TeriockProperty: typeof import("./documents/_documents.mjs").TeriockProperty;
  const TeriockResource: typeof import("./documents/_documents.mjs").TeriockResource;

  // Compendium collections
  // ----------------------

  const TeriockCharacterCompendium: typeof import("./documents/collections/_documents.mjs").TeriockCharacterCompendium;
  const TeriockEquipmentCompendium: typeof import("./documents/collections/_documents.mjs").TeriockEquipmentCompendium;
  const TeriockPowerCompendium: typeof import("./documents/collections/_documents.mjs").TeriockPowerCompendium;
  const TeriockRankCompendium: typeof import("./documents/collections/_documents.mjs").TeriockRankCompendium;
  const TeriockMacroCompendium: typeof import("./documents/collections/_documents.mjs").TeriockMacroCompendium;

  // Data Models
  // ===========

  // Base Data Models
  // ----------------

  const TeriockBaseActorData: typeof import("./data/actor-data/base-actor-data/base-actor-data.mjs").default;
  const TeriockBaseItemData: typeof import("./data/item-data/base-item-data/base-item-data.mjs").default;
  const TeriockBaseEffectData: typeof import("./data/effect-data/base-effect-data/base-effect-data.mjs").default;
  const TeriockBaseMessageData: typeof import("./data/message-data/base-message-data/base-message-data.mjs").default;

  // Actor
  // -----

  const TeriockCharacterData: typeof import("./data/_module.mjs").actor.CharacterData;

  // Item
  // ----

  const TeriockEquipmentData: typeof import("./data/_module.mjs").item.EquipmentData;
  const TeriockMechanicData: typeof import("./data/_module.mjs").item.MechanicData;
  const TeriockPowerData: typeof import("./data/_module.mjs").item.PowerData;
  const TeriockRankData: typeof import("./data/_module.mjs").item.RankData;

  // Effect
  // ------

  const TeriockAbilityData: typeof import("./data/_module.mjs").effect.AbilityData;
  const TeriockAttunementData: typeof import("./data/_module.mjs").effect.AttunementData;
  const TeriockConsequenceData: typeof import("./data/_module.mjs").effect.ConsequenceData;
  const TeriockConditionData: typeof import("./data/_module.mjs").effect.ConditionData;
  const TeriockFluencyData: typeof import("./data/_module.mjs").effect.FluencyData;
  const TeriockPropertyData: typeof import("./data/_module.mjs").effect.PropertyData;
  const TeriockResourceData: typeof import("./data/_module.mjs").effect.ResourceData;

  // Sheets
  // ======

  // Base Sheets
  // -----------

  const TeriockBaseActorSheet: typeof import("./applications/sheets/actor-sheets/base-actor-sheet/base-actor-sheet.mjs").default;
  const TeriockBaseItemSheet: typeof import("./applications/sheets/item-sheets/base-item-sheet/base-item-sheet.mjs").default;
  const TeriockBaseEffectSheet: typeof import("./applications/sheets/effect-sheets/base-effect-sheet/base-effect-sheet.mjs").default;

  // Actor
  // -----

  const TeriockCharacterSheet: typeof import("./applications/sheets/_module.mjs").actor.CharacterSheet;

  // Item
  // ----

  const TeriockEquipmentSheet: typeof import("./applications/sheets/_module.mjs").item.EquipmentSheet;
  const TeriockMechanicSheet: typeof import("./applications/sheets/_module.mjs").item.MechanicSheet;
  const TeriockPowerSheet: typeof import("./applications/sheets/_module.mjs").item.PowerSheet;
  const TeriockRankSheet: typeof import("./applications/sheets/_module.mjs").item.RankSheet;

  // Effect
  // ------

  const TeriockAbilitySheet: typeof import("./applications/sheets/_module.mjs").effect.AbilitySheet;
  const TeriockAttunementSheet: typeof import("./applications/sheets/_module.mjs").effect.AttunementSheet;
  const TeriockConsequenceSheet: typeof import("./applications/sheets/_module.mjs").effect.ConsequenceSheet;
  const TeriockConditionSheet: typeof import("./applications/sheets/_module.mjs").effect.ConditionSheet;
  const TeriockFluencySheet: typeof import("./applications/sheets/_module.mjs").effect.FluencySheet;
  const TeriockPropertySheet: typeof import("./applications/sheets/_module.mjs").effect.PropertySheet;
  const TeriockResourceSheet: typeof import("./applications/sheets/_module.mjs").effect.ResourceSheet;

  namespace Teriock {
    const __brand: unique symbol;

    /** FoundryVTT UUID */
    type UUID<T = unknown> = string & {
      [__brand]: T;
    };
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
