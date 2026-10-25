import type statConfig from "../static/config/stat-config.mjs";

import { CONFIG, DISPLAY, STATUSES } from "../static/_module.mjs";

declare global {
  namespace Teriock.Keys {
    // Tradecraft Keys
    export type Field = keyof typeof CONFIG.tradecraft.fields;
    export type Tradecraft = keyof typeof CONFIG.tradecraft.tradecrafts;

    // Ability Keys
    export type Maneuver = keyof typeof CONFIG.ability.maneuver;
    export type Interaction = keyof typeof CONFIG.ability.interaction;
    export type Target = keyof typeof CONFIG.ability.targets;
    export type Delivery = keyof typeof CONFIG.ability.delivery;
    export type ActiveExecutionTime = keyof typeof CONFIG.ability.maneuver.active.executionTimes;
    export type ReactiveExecutionTime = keyof typeof CONFIG.ability.maneuver.reactive.executionTimes;
    export type PassiveExecutionTime = keyof typeof CONFIG.ability.maneuver.passive.executionTimes;
    export type SlowExecutionTime = keyof typeof CONFIG.ability.maneuver.slow.executionTimes;
    export type ExecutionTime =
      | Teriock.Keys.ActiveExecutionTime
      | Teriock.Keys.PassiveExecutionTime
      | Teriock.Keys.ReactiveExecutionTime
      | Teriock.Keys.SlowExecutionTime;
    export type Expansion = keyof typeof CONFIG.ability.expansion;
    export type Effect = keyof typeof CONFIG.wiki.index.effect;

    // Tag Keys
    export type Element = keyof typeof CONFIG.wiki.index.element;
    export type Source = keyof typeof CONFIG.wiki.index.source;

    // Attribute Keys
    export type Attribute = keyof typeof CONFIG.attribute;

    // Stat Keys
    export type Stat = keyof typeof statConfig;
    export type DieStat = {
      [K in keyof typeof statConfig]: typeof statConfig[K] extends { pool: object } ? K : never;
    }[keyof typeof statConfig];

    // Command Keys
    export type PayMode = "exact" | "greedy";
    export type DeathBagStoneColor = keyof typeof CONFIG.deathBag.stones;
    export type Command = keyof typeof CONFIG.command;

    // Armament Keys
    export type Classification = keyof typeof CONFIG.wiki.index.classification;
    export type Style = keyof typeof CONFIG.wiki.index.style;
    export type EquipmentKind = keyof typeof CONFIG.equipment.kind;
    /** @deprecated Use {@link EquipmentKind} */
    export type PowerLevel = EquipmentKind;

    // Property Keys
    export type Property = keyof typeof CONFIG.wiki.index.property;

    // Species Keys
    export type Trait = keyof typeof CONFIG.wiki.index.trait;

    // Kind Keys
    export type Kind = keyof typeof CONFIG.system.defaultKinds;
    export type PowerKind = keyof typeof CONFIG.power.kind;
    export type EffectKind = keyof typeof CONFIG.effect.kind;
    export type AttunementKind = keyof typeof CONFIG.attunement.kind;
    export type RankKind = keyof typeof CONFIG.class.kind;

    // Effect Keys
    export type ApplicationTarget = keyof typeof CONFIG.effect.applicationTargets;
    export type IllusionLevel = keyof typeof CONFIG.illusion.level;
    export type TransformationLevel = keyof typeof CONFIG.transformation.level;

    // Display Keys
    export type Color = keyof typeof DISPLAY.colors;
    export type CardDisplaySize = keyof typeof CONFIG.display.sizes;

    // Status Keys
    export type HackableBodyPart = keyof typeof CONFIG.hack;
    export type Condition = keyof typeof STATUSES.conditions;
    export type Cover = keyof typeof STATUSES.cover;
    export type Hack = keyof typeof STATUSES.hacks;
    export type Status = Condition | Cover | Hack;

    // Rank Keys
    export type Archetype = keyof typeof CONFIG.class.archetypes;
    export type Class = keyof typeof CONFIG.class.classes;

    // Cost Keys
    export type Component = keyof typeof CONFIG.cost.components.keys;
    export type PrimaryCost = keyof typeof statConfig;
    export type CostTweak = keyof typeof CONFIG.cost.tweaks;

    // Affinity Keys
    export type AffinityType = keyof typeof CONFIG.affinity.types;

    // Category Keys
    export type Category = keyof typeof CONFIG.category;

    // Character Keys
    export type Currency = keyof typeof CONFIG.currency;
    export type Movement = keyof typeof CONFIG.character.movement;
    export type Sense = keyof typeof CONFIG.character.sense;
    export type Speed = keyof typeof CONFIG.character.speed;

    // Math Keys
    export type Comparison = keyof typeof CONFIG.math.comparisons;

    // Combat Keys
    export type CombatEvent = keyof typeof CONFIG.combat.event;
    export type CombatRelation = keyof typeof CONFIG.combat.relation;
    export type CombatTiming = keyof typeof CONFIG.combat.timing;
  }
}
