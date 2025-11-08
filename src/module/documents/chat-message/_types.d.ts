import { TeriockRoll } from "../../dice/_module.mjs";
import { TeriockActor } from "../_module.mjs";

declare module "./chat-message.mjs" {
  export default interface TeriockChatMessage
    extends Teriock.Documents.Interface<Teriock.Documents.NullDocument> {
    _id: Teriock.ID<TeriockChatMessage>;
    rolls: TeriockRoll[];
    readonly speakerActor: TeriockActor | null;

    get documentName(): "ChatMessage";

    get id(): Teriock.ID<TeriockChatMessage>;

    get uuid(): Teriock.UUID<TeriockChatMessage>;
  }
}

export {};
