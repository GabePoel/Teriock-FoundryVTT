import { ChatSpeakerData } from "@client/documents/_types.mjs";

import { TeriockUser } from "../_module.mjs";
import { BaseMessageSystem } from "../../data/systems/messages/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";

interface ChatMessageSubtype<T extends ChatMessageType>
  extends Teriock.Documents.Subtype<Teriock.Documents.ChatMessageInterface, T, null, ChatMessageSystemMap[T]>
{}

declare module "./chat-message.mjs" {
  export default interface TeriockChatMessage extends Teriock.Documents.ChatMessageInterface {}
}

declare global {
  export type TeriockChatMessage<T extends ChatMessageType = ChatMessageType> = T extends unknown
    ? ChatMessageSubtype<T>
    : never;
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
      system: BaseMessageSystem;

      get documentName(): "ChatMessage";

      get id(): ID<TeriockChatMessage>;

      get speakerActor(): TeriockActor | null;

      get uuid(): UUID<TeriockChatMessage>;
    }
  }
}

export {};
