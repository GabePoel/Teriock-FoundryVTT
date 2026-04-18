import { config, data, display, index } from "../constants/_module.mjs";
import { settings } from "../setup/system-settings.mjs";

declare global {
  namespace Teriock.Keys {
    // System Keys
    export type Setting = {
      [Category in keyof typeof settings]: keyof (typeof settings)[Category];
    }[keyof typeof settings];

    // Tradecraft Keys
    export type Field = keyof typeof config.tradecraft;
    export type ArtisanTradecraft =
      keyof typeof config.tradecraft.artisan.tradecrafts;
    export type MediatorTradecraft =
      keyof typeof config.tradecraft.mediator.tradecrafts;
    export type ScholarTradecraft =
      keyof typeof config.tradecraft.scholar.tradecrafts;
    export type SurvivalistTradecraft =
      keyof typeof config.tradecraft.survivalist.tradecrafts;
    export type Tradecraft =
      | ArtisanTradecraft
      | MediatorTradecraft
      | ScholarTradecraft
      | SurvivalistTradecraft;

    // Ability Keys
    export type Maneuver = keyof typeof config.ability.maneuver;
    export type Interaction = keyof typeof config.ability.interaction;
    export type Target = keyof typeof config.ability.targets;
    export type Delivery = keyof typeof config.ability.delivery;
    export type ActiveExecutionTime =
      keyof typeof config.ability.executionTime.active;
    export type ReactiveExecutionTime =
      keyof typeof config.ability.executionTime.reactive;
    export type PassiveExecutionTime =
      keyof typeof config.ability.executionTime.passive;
    export type SlowExecutionTime =
      | keyof typeof config.ability.executionTime.slow
      | string;
    export type ExecutionTime =
      | Teriock.Keys.ActiveExecutionTime
      | Teriock.Keys.ReactiveExecutionTime
      | Teriock.Keys.PassiveExecutionTime
      | Teriock.Keys.SlowExecutionTime;
    export type Expansion = keyof typeof config.ability.expansion;
    export type EffectType = keyof typeof index.effectTypes;

    // Tag Keys
    export type Element = keyof typeof index.elements;
    export type PowerSource = keyof typeof index.powerSources;

    // Attribute Keys
    export type StatAttribute = keyof typeof index.statAttributes;
    export type Attribute = keyof typeof index.attributes;

    // Stat Keys
    export type DieStat = "hp" | "mp";

    // Impact Keys
    export type PayMode = "exact" | "greedy";
    export type DeathBagStoneColor = keyof typeof config.die.deathBagStoneColor;
    export type Impact = keyof typeof config.impact;
    export type CommonOutcome = keyof typeof config.consequence.common;

    // Armament Keys
    export type EquipmentClass = keyof typeof index.equipmentClasses;
    export type WeaponClass = keyof typeof index.weaponClasses;
    export type WeaponFightingStyle = keyof typeof index.weaponFightingStyles;
    export type PowerLevel = keyof typeof config.equipment.powerLevel;

    // Property Keys
    export type MagicalProperty = keyof typeof index.magicalProperties;
    export type MaterialProperty = keyof typeof index.materialProperties;
    export type Property = keyof typeof index.properties;

    // Species Keys
    export type Trait = keyof typeof index.traits;

    // Power Keys
    export type PowerType = keyof typeof config.power.type;

    // Effect Keys
    export type Form = keyof typeof config.effect.form;
    export type ApplicationTarget =
      keyof typeof config.effect.applicationTargets;
    export type IllusionLevel = keyof typeof config.illusion.level;
    export type TransformationLevel = keyof typeof config.transformation.level;

    // Display Keys
    export type Color = keyof typeof display.colors;
    export type CardDisplaySize = keyof typeof config.display.sizes;

    // Status Keys
    export type HackableBodyPart = keyof typeof config.hack;
    export type Condition = keyof typeof index.conditions;
    export type Cover = (typeof data.cover)[keyof typeof data.cover]["id"];
    export type Hack = (typeof data.hacks)[keyof typeof data.hacks]["id"];
    export type Status = Condition | Cover | Hack;

    // Attunement Keys
    export type AttunementType = keyof typeof config.attunement.type;

    // Rank Keys
    export type Archetype = keyof typeof config.rank;
    export type MageClass = keyof typeof config.rank.mage.classes;
    export type SemiClass = keyof typeof config.rank.semi.classes;
    export type WarriorClass = keyof typeof config.rank.warrior.classes;
    export type EverymanClass = keyof typeof config.rank.everyman.classes;
    export type Class = MageClass | SemiClass | WarriorClass | EverymanClass;

    // Cost Keys
    export type Component = keyof typeof config.cost.components.keys;
    export type PrimaryCost = keyof typeof config.cost.primary.keys;
    export type CostTweak = keyof typeof config.cost.tweaks;

    // Protection Keys
    export type ProtectionType = keyof typeof config.protection.types;
    export type ProtectionCategory = keyof typeof config.protection.categories;

    // Character Keys
    export type Movement = keyof typeof config.character.movement;
    export type Sense = keyof typeof config.character.sense;
    export type Speed = keyof typeof config.character.speed;
  }
}
