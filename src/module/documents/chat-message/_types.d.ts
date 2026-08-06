import { ChatSpeakerData } from "@client/documents/_types.mjs";

import { TeriockChatMessage, TeriockUser } from "../_module.mjs";
import { BaseMessageSystem, InteractiveSystem, TriggeredSystem } from "../../data/systems/messages/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";

declare global {
  export interface TeriockInteractive
    extends Teriock.Documents.Subtype<Teriock.Documents.ChatMessageInterface, "interactive", null, InteractiveSystem>
  {}

  export interface TeriockTriggered
    extends Teriock.Documents.Subtype<Teriock.Documents.ChatMessageInterface, "triggered", null, TriggeredSystem>
  {}

  export interface ChatMessageTypeMap {
    base: TeriockChatMessage;
    interactive: TeriockInteractive;
    triggered: TeriockTriggered;
  }
}

declare global {
  namespace Teriock.Data {
    export interface ChatMessageData {
      author: ID<TeriockUser>;
      content: string;
      rolls: BaseRoll[];
      speaker: ChatSpeakerData;
      system: Partial<Teriock.Data.InteractiveMessageData>;
    }
  }

  namespace Teriock.Documents {
    export interface ChatMessageInterface {
      _id: ID<TeriockChatMessage>;
      author: TeriockUser;
      rolls: BaseRoll[];
      system: BaseMessageSystem | InteractiveSystem | TriggeredSystem;

      get documentName(): "ChatMessage";

      get id(): ID<TeriockChatMessage>;

      get speakerActor(): AnyActor | null;

      get uuid(): UUID<TeriockChatMessage>;
    }
  }
}

export {};
