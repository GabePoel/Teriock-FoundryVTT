import { ClassSystem, HarmSystem, RuleSystem, TradecraftSystem } from "./_module.mjs";

declare global {
  export interface JournalEntryPageSystemMap {
    class: ClassSystem;
    damage: HarmSystem;
    drain: HarmSystem;
    rule: RuleSystem;
    tradecraft: TradecraftSystem;
  }

  export type JournalEntryPageType = TypeMapKey<JournalEntryPageSystemMap>;
}
