import "./helpers/commands/_types";
import "./data/_types";
import "./applications/_types";
import "./documents/_types";

declare global {
  const TERIOCK: typeof import("./constants/_module.mjs");

  // Base document classes
  // =====================

  const TeriockActor: typeof import("./documents/actor.mjs").default;
  const TeriockChatMessage: typeof import("./documents/chat-message.mjs").default;
  const TeriockEffect: typeof import("./documents/effect.mjs").default;
  const TeriockFolder: typeof import("./documents/folder.mjs").default;
  const TeriockItem: typeof import("./documents/item.mjs").default;
  const TeriockMacro: typeof import("./documents/macro.mjs").default;
  const TeriockScene: typeof import("./documents/scene.mjs").default;
  const TeriockTokenDocument: typeof import("./documents/token-document.mjs").default;
  const TeriockUser: typeof import("./documents/user.mjs").default;

  // General document types
  // ======================
  export type TeriockParent = typeof TeriockActor | typeof TeriockItem;
  export type TeriockChild = typeof TeriockItem | typeof TeriockEffect;

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

  const TeriockCompendiumCollection: typeof import("./documents/_collections.mjs").TeriockCompendiumCollection;
  const TeriockCharacterCompendium: typeof import("./documents/_collections.mjs").TeriockCharacterCompendium;
  const TeriockEquipmentCompendium: typeof import("./documents/_collections.mjs").TeriockEquipmentCompendium;
  const TeriockPowerCompendium: typeof import("./documents/_collections.mjs").TeriockPowerCompendium;
  const TeriockWrapperCompendium: typeof import("./documents/_collections.mjs").TeriockWrapperCompendium;
  const TeriockRankCompendium: typeof import("./documents/_collections.mjs").TeriockRankCompendium;
  const TeriockMacroCompendium: typeof import("./documents/_collections.mjs").TeriockMacroCompendium;

  // Data Models
  // ===========

  // Base Data Models
  // ----------------

  const TeriockBaseActorModel: typeof import("./data/actor-data/base-actor-data/base-actor-data.mjs").default;
  const TeriockBaseItemModel: typeof import("./data/item-data/base-item-data/base-item-data.mjs").default;
  const TeriockBaseEffectModel: typeof import("./data/effect-data/base-effect-data/base-effect-data.mjs").default;
  const TeriockBaseMessageModel: typeof import("./data/message-data/base-message-data/base-message-data.mjs").default;

  // Actor
  // -----

  const TeriockCharacterModel: typeof import("./data/_module.mjs").actor.TeriockCharacterModel;

  // Item
  // ----

  const TeriockEquipmentModel: typeof import("./data/_module.mjs").item.TeriockEquipmentModel;
  const TeriockMechanicModel: typeof import("./data/_module.mjs").item.TeriockMechanicModel;
  const TeriockPowerModel: typeof import("./data/_module.mjs").item.TeriockPowerModel;
  const TeriockRankModel: typeof import("./data/_module.mjs").item.TeriockRankModel;

  // Effect
  // ------

  const TeriockAbilityModel: typeof import("./data/_module.mjs").effect.TeriockAbilityModel;
  const TeriockAttunementModel: typeof import("./data/_module.mjs").effect.TeriockAttunementModel;
  const TeriockConsequenceModel: typeof import("./data/_module.mjs").effect.TeriockConsequenceModel;
  const TeriockConditionModel: typeof import("./data/_module.mjs").effect.TeriockConditionModel;
  const TeriockFluencyModel: typeof import("./data/_module.mjs").effect.TeriockFluencyModel;
  const TeriockPropertyModel: typeof import("./data/_module.mjs").effect.TeriockPropertyModel;
  const TeriockResourceModel: typeof import("./data/_module.mjs").effect.TeriockResourceModel;

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

  // Placeables
  // ==========

  const TeriockToken: typeof import("./canvas/placeables/token.mjs").default;

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
