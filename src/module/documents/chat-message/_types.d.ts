import { TeriockChatMessage } from "../_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { BaseMessageSystem } from "../../data/systems/messages/_module.mjs";

declare global {
  namespace Teriock.Data {
    export interface ChatMessageData {
      content: string;
      rolls: BaseRoll[];
      speaker: Teriock.Foundry.ChatSpeakerData;
      system: Partial<Teriock.Data.BaseMessageData>;
    }
  }

  namespace Teriock.Documents {
    export interface ChatMessageInterface {
      _id: ID<TeriockChatMessage>;
      rolls: BaseRoll[];
      system: BaseMessageSystem;

      get documentName(): "ChatMessage";

      get id(): ID<TeriockChatMessage>;

      get speakerActor(): GenericActor | null;

      get uuid(): UUID<TeriockChatMessage>;
    }
  }
}

export {};
