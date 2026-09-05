import { BaseMessageSystem, InteractiveSystem, SharedSystem, TriggeredSystem } from "./_module.mjs";

declare global {
  export interface ChatMessageSystemMap {
    base: BaseMessageSystem;
    interactive: InteractiveSystem;
    shared: SharedSystem;
    triggered: TriggeredSystem;
  }

  export type ChatMessageType = TypeMapKey<ChatMessageSystemMap>;
}
