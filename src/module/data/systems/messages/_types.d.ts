import { BaseMessageSystem, InteractiveSystem, TriggeredSystem } from "./_module.mjs";

declare global {
  export interface ChatMessageSystemMap {
    base: BaseMessageSystem;
    interactive: InteractiveSystem;
    triggered: TriggeredSystem;
  }

  export type ChatMessageType = TypeMapKey<ChatMessageSystemMap>;
}
