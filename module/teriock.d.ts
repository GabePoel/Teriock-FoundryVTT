import "./commands/_types";
import "./data/_types";
import "./sheets/_types";
import * as Chat from "./types/chat";
import * as Command from "./types/command";
import * as DocumentTypes from "./types/document-types";
import * as Messages from "./types/messages";
import * as Parameters from "./types/parameters";
import * as Rolls from "./types/rolls";
import * as Ui from "./types/ui";
import * as Updates from "./types/updates";
import * as Wiki from "./types/wiki";

declare global {
  // Base document classes
  // ---------------------

  const TeriockActor: typeof import("./documents/actor.mjs").default;
  const TeriockItem: typeof import("./documents/item.mjs").default;
  const TeriockEffect: typeof import("./documents/effect.mjs").default;

  // Virtual document classes
  // ------------------------
  // Actor
  const TeriockCharacter: typeof import("./documents/_documents.mjs").TeriockCharacter;
  // Item
  const TeriockEquipment: typeof import("./documents/_documents.mjs").TeriockEquipment;
  const TeriockPower: typeof import("./documents/_documents.mjs").TeriockPower;
  const TeriockRank: typeof import("./documents/_documents.mjs").TeriockRank;
  // Effect
  const TeriockAbility: typeof import("./documents/_documents.mjs").TeriockAbility;
  const TeriockAttunement: typeof import("./documents/_documents.mjs").TeriockAttunement;
  const TeriockCondition: typeof import("./documents/_documents.mjs").TeriockCondition;
  const TeriockFluency: typeof import("./documents/_documents.mjs").TeriockFluency;
  const TeriockProperty: typeof import("./documents/_documents.mjs").TeriockProperty;
  const TeriockResource: typeof import("./documents/_documents.mjs").TeriockResource;

  namespace Teriock {
    type ActorType = DocumentTypes.ActorType;
    type ItemType = DocumentTypes.ItemType;
    type EffectType = DocumentTypes.EffectType;
    type CommandCallbackContext = Command.CommandCallbackContext;
    type ChatActionButton = Chat.ChatActionButton;
    type ChatOptions = Command.ChatOptions;
    type CommandOptions = Command.CommandOptions;
    type CommandExecuteContext = Command.CommandExecuteContext;
    type CommandCallback = Command.CommandCallback;
    type ChatSpeakerData = Messages.ChatSpeakerData;
    type MessageBar = Messages.MessageBar;
    type MessageBlock = Messages.MessageBlock;
    type MessageOptions = Messages.MessageOptions;
    type MessageParts = Messages.MessageParts;
    type CommonRollOptions = Rolls.CommonRollOptions;
    type EquipmentRollOptions = Rolls.EquipmentRollOptions;
    type ConditionRollOptions = Rolls.ConditionRollOptions;
    type PolyhedralDie = Rolls.PolyhedralDie;
    type ThreeToggle = Ui.ThreeToggle;
    type SkipFunctions = Updates.SkipFunctions;
    type WikiPullOptions = Wiki.WikiPullOptions;
    type HackableBodyPart = Parameters.HackableBodyPart;
  }
}

export {};
