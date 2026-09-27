import system from "../../../../system.json";
import { CharacterSystem, CreatureSystem, InventorySystem } from "./actors/_module.mjs";
import { BaseCardsSystem, StoneSystem } from "./cards/_module.mjs";
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

type DocumentTypes = typeof system.documentTypes;

/** Requires `Map` to have exactly the keys `Type`. */
type ExactKeys<Map extends Record<Type, object> & Record<Exclude<keyof Map, Type>, never>, Type extends PropertyKey> =
  Map;

/** Fails type checking when a system map disagrees with the subtypes in `system.json`. */
type _SystemMapsMatchManifest = [
  ExactKeys<ActiveEffectSystemMap, "base" | keyof DocumentTypes["ActiveEffect"]>,
  ExactKeys<ActorSystemMap, keyof DocumentTypes["Actor"]>,
  ExactKeys<CardSystemMap, "base" | keyof DocumentTypes["Card"]>,
  ExactKeys<ChatMessageSystemMap, "base" | keyof DocumentTypes["ChatMessage"]>,
  ExactKeys<ItemSystemMap, keyof DocumentTypes["Item"]>,
  ExactKeys<JournalEntryPageSystemMap, keyof DocumentTypes["JournalEntryPage"]>,
];

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
    base: BaseCardsSystem;
    stone: StoneSystem;
  }

  export interface ChatMessageSystemMap {
    base: BaseMessageSystem;
    interactive: InteractiveSystem;
    shared: SharedSystem;
    triggered: TriggeredSystem;
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
  export type ItemType = TypeMapKey<ItemSystemMap>;
  export type JournalEntryPageType = TypeMapKey<JournalEntryPageSystemMap>;
}

export {};
