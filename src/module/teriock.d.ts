import "./commands/_types";
import "./data/_types";
import "./sheets/_types";
import * as Chat from "./types/chat";
import * as Command from "./types/command";
import * as DocumentTypes from "./types/document-types";
import * as Messages from "./types/messages";
import * as Metadata from "./types/metadata";
import * as Parameters from "./types/parameters";
import * as Queries from "./types/queries";
import * as Rolls from "./types/rolls";
import * as Ui from "./types/ui";
import * as Updates from "./types/updates";
import * as Wiki from "./types/wiki";

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
  const TeriockRoll: typeof import("./documents/roll.mjs").default;
  const TeriockScene: typeof import("./documents/scene.mjs").default;
  const TeriockToken: typeof import("./documents/token.mjs").default;
  const TeriockUser: typeof import("./documents/user.mjs").default;

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

  namespace Teriock {
    type ActorType = DocumentTypes.ActorType;
    type ChatOptions = Command.ChatOptions;
    type ChatSpeakerData = Messages.ChatSpeakerData;
    type CommandCallback = Command.CommandCallback;
    type CommandExecuteContext = Command.CommandExecuteContext;
    type CommandOptions = Command.CommandOptions;
    type CommonRollOptions = Rolls.CommonRollOptions;
    type ConditionRollOptions = Rolls.ConditionRollOptions;
    type CritRollOptions = Rolls.CritRollOptions;
    type EffectMetadata = Metadata.EffectMetadata;
    type EffectType = DocumentTypes.EffectType;
    type EquipmentRollOptions = Rolls.EquipmentRollOptions;
    type HTMLButtonConfig = Chat.HTMLButtonConfig;
    type HackableBodyPart = Parameters.HackableBodyPart;
    type ItemType = DocumentTypes.ItemType;
    type MessageOptions = Messages.MessageOptions;
    type MessageParts = Messages.MessageParts;
    type PolyhedralDie = Rolls.PolyhedralDie;
    type QueryInCombatExpirationData = Queries.QueryInCombatExpirationData;
    type SkipFunctions = Updates.SkipFunctions;
    type ThreeToggle = Ui.ThreeToggle;
    type WikiPullOptions = Wiki.WikiPullOptions;

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
