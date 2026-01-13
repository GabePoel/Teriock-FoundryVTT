import { TeriockRoll } from "../../dice/_module.mjs";
import { TeriockActor } from "../_module.mjs";
import { BaseMessageSystem } from "../../data/systems/messages/_module.mjs";

declare global {
  namespace Teriock.Data {
    export interface ChatMessageData {
      content: string;
      rolls: TeriockRoll[];
      speaker: Teriock.Foundry.ChatSpeakerData;
      system: Partial<Teriock.Data.BaseMessageData>;
    }
  }
}

declare module "./chat-message.mjs" {
  export default interface TeriockChatMessage
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: ID<TeriockChatMessage>;
    rolls: TeriockRoll[];
    readonly speakerActor: TeriockActor | null;
    system: BaseMessageSystem;

    get documentName(): "ChatMessage";
    get id(): ID<TeriockChatMessage>;
    get uuid(): UUID<TeriockChatMessage>;
  }
}
