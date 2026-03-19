import { data, display, index, options } from "../constants/_module.mjs";
import { settings } from "../setup/system-settings.mjs";

declare global {
  namespace Teriock.Keys {
    // System Keys
    export type Setting = {
      [Category in keyof typeof settings]: keyof (typeof settings)[Category];
    }[keyof typeof settings];

    // Tradecraft Keys
    export type Field = keyof typeof options.tradecraft;
    export type ArtisanTradecraft =
      keyof typeof options.tradecraft.artisan.tradecrafts;
    export type MediatorTradecraft =
      keyof typeof options.tradecraft.mediator.tradecrafts;
    export type ScholarTradecraft =
      keyof typeof options.tradecraft.scholar.tradecrafts;
    export type SurvivalistTradecraft =
      keyof typeof options.tradecraft.survivalist.tradecrafts;
    export type Tradecraft =
      | ArtisanTradecraft
      | MediatorTradecraft
      | ScholarTradecraft
      | SurvivalistTradecraft;

    // Ability Keys
    export type Maneuver = keyof typeof options.ability.maneuver;
    export type Interaction = keyof typeof options.ability.interaction;
    export type Target = keyof typeof options.ability.targets;
    export type Delivery = keyof typeof options.ability.delivery;
    export type ActiveExecutionTime =
      keyof typeof options.ability.executionTime.active;
    export type ReactiveExecutionTime =
      keyof typeof options.ability.executionTime.reactive;
    export type PassiveExecutionTime =
      keyof typeof options.ability.executionTime.passive;
    export type SlowExecutionTime =
      | keyof typeof options.ability.executionTime.slow
      | string;
    export type ExecutionTime =
      | Teriock.Keys.ActiveExecutionTime
      | Teriock.Keys.ReactiveExecutionTime
      | Teriock.Keys.PassiveExecutionTime
      | Teriock.Keys.SlowExecutionTime;
    export type Expansion = keyof typeof options.ability.expansion;
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
    export type DeathBagStoneColor =
      keyof typeof options.die.deathBagStoneColor;
    export type RollImpact = keyof typeof options.consequence.rolls;
    export type CommonImpact = keyof typeof options.consequence.common;

    // Armament Keys
    export type EquipmentClass = keyof typeof index.equipmentClasses;
    export type WeaponClass = keyof typeof index.weaponClasses;
    export type WeaponFightingStyle = keyof typeof index.weaponFightingStyles;
    export type PowerLevel = keyof typeof options.equipment.powerLevel;

    // Property Keys
    export type MagicalProperty = keyof typeof index.magicalProperties;
    export type MaterialProperty = keyof typeof index.materialProperties;
    export type Property = keyof typeof index.properties;

    // Species Keys
    export type Trait = keyof typeof index.traits;

    // Power Keys
    export type PowerType = keyof typeof options.power;

    // Effect Keys
    export type Form = keyof typeof options.effect.form;
    export type IllusionLevel = keyof typeof options.effect.illusionLevel;
    export type TransformationLevel =
      keyof typeof options.effect.transformationLevel;

    // Display Keys
    export type Color = keyof typeof display.colors;
    export type CardDisplaySize = keyof typeof options.display.sizes;

    // Status Keys
    export type HackableBodyPart = keyof typeof options.hack;
    export type Condition = keyof typeof index.conditions;
    export type Cover = (typeof data.cover)[keyof typeof data.cover]["id"];
    export type Hack = (typeof data.hacks)[keyof typeof data.hacks]["id"];
    export type Transformation =
      (typeof data.transformations)[keyof typeof data.transformations]["id"];
    export type Status = Condition | Cover | Hack | Transformation;

    // Attunement Keys
    export type AttunementType = keyof typeof options.attunement.attunementType;

    // Rank Keys
    export type Archetype = keyof typeof options.rank;
    export type MageClass = keyof typeof options.rank.mage.classes;
    export type SemiClass = keyof typeof options.rank.semi.classes;
    export type WarriorClass = keyof typeof options.rank.warrior.classes;
    export type EverymanClass = keyof typeof options.rank.everyman.classes;
    export type Class = MageClass | SemiClass | WarriorClass | EverymanClass;

    // Cost Keys
    export type Component = keyof typeof options.cost.components.keys;
    export type PrimaryCost = keyof typeof options.cost.primary.keys;
    export type CostTweak = keyof typeof options.cost.tweaks;

    // Protection Keys
    export type ProtectionType = keyof typeof options.protection.types;
    export type ProtectionCategory = keyof typeof options.protection.categories;
  }
}
