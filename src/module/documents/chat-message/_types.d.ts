import { ChatSpeakerData } from "@client/documents/_types.mjs";

import { TeriockChatMessage, TeriockUser } from "../_module.mjs";
import { BaseMessageSystem, InteractiveSystem } from "../../data/systems/messages/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";

declare global {
  export type TeriockInteractive = Teriock.Documents.Subtype<
    Teriock.Documents.ChatMessageInterface,
    "interactive",
    null,
    InteractiveSystem
  >;

  export interface ChatMessageTypeMap {
    base: TeriockChatMessage;
    interactive: TeriockInteractive;
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
      system: BaseMessageSystem | InteractiveSystem;

      get documentName(): "ChatMessage";

      get id(): ID<TeriockChatMessage>;

      get speakerActor(): AnyActor | null;

      get uuid(): UUID<TeriockChatMessage>;
    }
  }
}

export {};
