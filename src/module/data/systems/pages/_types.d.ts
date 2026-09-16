import { ClassSystem, HarmSystem, RuleSystem, StyleSystem, TradecraftSystem } from "./_module.mjs";

declare global {
  export interface JournalEntryPageSystemMap {
    class: ClassSystem;
    damage: HarmSystem;
    drain: HarmSystem;
    rule: RuleSystem;
    style: StyleSystem;
    tradecraft: TradecraftSystem;
  }

  export type JournalEntryPageType = TypeMapKey<JournalEntryPageSystemMap>;
}
