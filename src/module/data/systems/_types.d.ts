import { CharacterSystem, CreatureSystem, InventorySystem } from "./actors/_module.mjs";
import { BaseCardSystem, StoneSystem } from "./cards/_module.mjs";
import { BaseCombatantSystem } from "./combatants/_module.mjs";
import {
  AbilitySystem,
  AttunementSystem,
  BaseEffectSystem,
  ConditionSystem,
  ConsequenceSystem,
  CoverSystem,
  FluencySystem,
  HackSystem,
  ImbuementSystem,
  PropertySystem,
  ResourceSystem,
} from "./effects/_module.mjs";
import {
  ArchetypeSystem,
  BodySystem,
  EquipmentSystem,
  MountSystem,
  PowerSystem,
  RankSystem,
  SpeciesSystem,
} from "./items/_module.mjs";
import { BaseMessageSystem, InteractiveSystem, SharedSystem, TriggeredSystem } from "./messages/_module.mjs";
import { ClassSystem, DamageSystem, DrainSystem, RuleSystem, StyleSystem, TradecraftSystem } from "./pages/_module.mjs";

declare global {
  export interface ActiveEffectSystemMap {
    ability: AbilitySystem;
    attunement: AttunementSystem;
    base: BaseEffectSystem;
    condition: ConditionSystem;
    consequence: ConsequenceSystem;
    cover: CoverSystem;
    fluency: FluencySystem;
    hack: HackSystem;
    imbuement: ImbuementSystem;
    property: PropertySystem;
    resource: ResourceSystem;
  }

  export interface ActorSystemMap {
    character: CharacterSystem;
    creature: CreatureSystem;
    inventory: InventorySystem;
  }

  export interface CardSystemMap {
    base: BaseCardSystem;
    stone: StoneSystem;
  }

  export interface ChatMessageSystemMap {
    base: BaseMessageSystem;
    interactive: InteractiveSystem;
    shared: SharedSystem;
    triggered: TriggeredSystem;
  }

  export interface CombatantSystemMap {
    base: BaseCombatantSystem;
  }

  export interface ItemSystemMap {
    archetype: ArchetypeSystem;
    body: BodySystem;
    equipment: EquipmentSystem;
    mount: MountSystem;
    power: PowerSystem;
    rank: RankSystem;
    species: SpeciesSystem;
  }

  export interface JournalEntryPageSystemMap {
    class: ClassSystem;
    damage: DamageSystem;
    drain: DrainSystem;
    rule: RuleSystem;
    style: StyleSystem;
    tradecraft: TradecraftSystem;
  }

  export type ActiveEffectType = TypeMapKey<ActiveEffectSystemMap>;
  export type ActorType = TypeMapKey<ActorSystemMap>;
  export type CardType = TypeMapKey<CardSystemMap>;
  export type ChatMessageType = TypeMapKey<ChatMessageSystemMap>;
  export type CombatantType = TypeMapKey<CombatantSystemMap>;
  export type ItemType = TypeMapKey<ItemSystemMap>;
  export type JournalEntryPageType = TypeMapKey<JournalEntryPageSystemMap>;
}

export {};
