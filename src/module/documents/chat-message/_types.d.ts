import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { TeriockActor } from "../_module.mjs";
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
}

declare module "./chat-message.mjs" {
  export default interface TeriockChatMessage
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockChatMessage>;
    rolls: BaseRoll[];
    readonly speakerActor: TeriockActor | null;
    system: BaseMessageSystem;

    get documentName(): "ChatMessage";
    get id(): ID<TeriockChatMessage>;
    get uuid(): UUID<TeriockChatMessage>;
  }
}
