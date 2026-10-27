import {
  CreatureSystem,
  EnvironmentSystem,
  InventorySystem,
  NonPlayerCharacterSystem,
  PlayableCharacterSystem,
} from "./actors/_module.mjs";
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
import { BaseGroupSystem, CommandedSystem, MobSystem } from "./groups/_module.mjs";
import {
  ArchetypeSystem,
  BackstorySystem,
  BlessingSystem,
  BodySystem,
  CurseSystem,
  EquipmentSystem,
  FamiliarSystem,
  MountSystem,
  PactSystem,
  PowerSystem,
  RankSystem,
  ScarSystem,
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
    creature: CreatureSystem;
    environment: EnvironmentSystem;
    inventory: InventorySystem;
    npc: NonPlayerCharacterSystem;
    pc: PlayableCharacterSystem;
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

  export interface CombatantGroupSystemMap {
    base: BaseGroupSystem;
    commanded: CommandedSystem;
    mob: MobSystem;
  }

  export interface ItemSystemMap {
    archetype: ArchetypeSystem;
    backstory: BackstorySystem;
    blessing: BlessingSystem;
    body: BodySystem;
    curse: CurseSystem;
    equipment: EquipmentSystem;
    familiar: FamiliarSystem;
    mount: MountSystem;
    pact: PactSystem;
    power: PowerSystem;
    rank: RankSystem;
    scar: ScarSystem;
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
  export type CombatantGroupType = TypeMapKey<CombatantGroupSystemMap>;
  export type ItemType = TypeMapKey<ItemSystemMap>;
  export type JournalEntryPageType = TypeMapKey<JournalEntryPageSystemMap>;
}

export {};
