import { ChatSpeakerData } from "@client/documents/_types.mjs";

import { TeriockActor as ActorClass, TeriockChatMessage as ChatMessageClass, TeriockUser } from "../_module.mjs";
import { BaseMessageSystem } from "../../data/systems/messages/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";

type ChatMessageSubtype<T extends ChatMessageType> = ChatMessageClass & {
  system: ChatMessageSystemMap[T];
  type: T;
};

declare module "./chat-message.mjs" {
  export default interface TeriockChatMessage {
    _id: Readonly<ID<TeriockChatMessage>>;
    author: TeriockUser;
    rolls: BaseRoll[];
    system: BaseMessageSystem;
    type: ChatMessageType;

    get documentName(): "ChatMessage";
    get id(): ID<TeriockChatMessage>;
    get speakerActor(): ActorClass | null;
    get uuid(): UUID<TeriockChatMessage>;
  }
}

declare global {
  export type TeriockChatMessage<T extends ChatMessageType = ChatMessageType> = T extends unknown
    ? ChatMessageSubtype<T>
    : never;

  namespace Teriock.Data {
    export interface ChatMessageData {
      author: ID<TeriockUser>;
      content: string;
      rolls: BaseRoll[];
      speaker: ChatSpeakerData;
      system: Partial<Teriock.Data.InteractiveMessageData>;
    }
  }
}

export {};
