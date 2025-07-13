import "./commands/_types";
import "./data/_types";
import "./documents/_types";
import "./sheets/_types";
import "./types/documents";
import * as Chat from "./types/chat";
import * as Command from "./types/command";
import * as Messages from "./types/messages";
import * as Rolls from "./types/rolls";
import * as Ui from "./types/ui";
import * as Updates from "./types/updates";
import * as Wiki from "./types/wiki";
import * as Parameters from "./types/parameters";

declare global {
  namespace Teriock {
    export type ChatActionButton = Chat.ChatActionButton;
    export type CommandOptions = Command.CommandOptions;
    export type ChatOptions = Command.ChatOptions;
    export type MessageBar = Messages.MessageBar;
    export type MessageBlock = Messages.MessageBlock;
    export type MessageParts = Messages.MessageParts;
    export type MessageOptions = Messages.MessageOptions;
    export type CommonRollOptions = Rolls.CommonRollOptions;
    export type EquipmentRollOptions = Rolls.EquipmentRollOptions;
    export type ConditionRollOptions = Rolls.ConditionRollOptions;
    export type PolyhedralDie = Rolls.PolyhedralDie;
    export type ThreeToggle = Ui.ThreeToggle;
    export type SkipFunctions = Updates.SkipFunctions;
    export type WikiPullOptions = Wiki.WikiPullOptions;
    export type HackableBodyPart = Parameters.HackableBodyPart;
  }
}
