import type { equipmentclasses } from "../helpers/constants/generated/equipment-classes.mjs";
import type { weaponclasses } from "../helpers/constants/generated/weapon-classes.mjs";
import type { weaponFightingStyles } from "../helpers/constants/generated/weapon-fighting-styles.mjs";
import type { abilityOptions } from "../helpers/constants/ability-options.mjs";
import type { conditions } from "../helpers/constants/generated/conditions.mjs";
import type { tradecraftOptions } from "../helpers/constants/tradecraft-options.mjs";
import type { unsortedPseudoHooks } from "../helpers/constants/pseudo-hooks.mjs";
import type { properties } from "../helpers/constants/generated/properties.mjs";
import type { materialProperties } from "../helpers/constants/generated/material-properties.mjs";
import type { magicalProperties } from "../helpers/constants/generated/magical-properties.mjs";
import type { powerOptions } from "../helpers/constants/power-options.mjs";
import type { rankOptions } from "../helpers/constants/rank-options.mjs";
import type { fonts } from "../helpers/constants/fonts.mjs";
import type { resourceOptions } from "../helpers/constants/resource-options.mjs";

// Actor typing

/** Valid hackable body parts */
export type HackableBodyPart =
  | "arm"
  | "leg"
  | "body"
  | "ear"
  | "eye"
  | "mouth"
  | "nose";

/** Valid stat attributes */
export type StatAttribute = keyof typeof abilityOptions.attribute;

/** Valid attributes */
export type Attribute = Teriock.StatAttribute | "unp";

/** Valid conditions */
export type ConditionKey = keyof typeof conditions;

/** Valid pseudo-hooks */
export type PseudoHook = keyof typeof unsortedPseudoHooks;

// Ability typing

/** Ability type */
export type Form = keyof typeof abilityOptions.form;

/** Valid maneuvers */
export type Maneuver = keyof typeof abilityOptions.maneuver;

/** Valid interactions */
export type Interaction = keyof typeof abilityOptions.interaction;

/** Valid execution times for active maneuvers */
export type ActiveExecutionTime =
  keyof typeof abilityOptions.executionTime.active;

/** Valid execution times for reactive maneuvers */
export type ReactiveExecutionTime =
  keyof typeof abilityOptions.executionTime.reactive;

/** Valid execution times for passive maneuvers */
export type PassiveExecutionTime =
  keyof typeof abilityOptions.executionTime.passive;

/** Valid execution times for slow maneuvers */
export type SlowExecutionTime =
  | keyof typeof abilityOptions.executionTime.slow
  | string;

/** Valid execution times */
export type ExecutionTime =
  | Teriock.ActiveExecutionTime
  | Teriock.ReactiveExecutionTime
  | Teriock.PassiveExecutionTime
  | Teriock.SlowExecutionTime;

/**
 * Effect types
 */
export type EffectTag = keyof typeof abilityOptions.effects;

/**
 * Targets
 */
export type Target = keyof typeof abilityOptions.targets;

/**
 * Deliveries
 */
export type Delivery = keyof typeof abilityOptions.delivery;

/**
 * Valid elements
 */
export type Element = keyof typeof abilityOptions.elements;

/** Valid power sources */
export type PowerSource = keyof typeof abilityOptions.powerSources;

/** Expansion */
export type Expansion = keyof typeof abilityOptions.expansion;

/** Piercing */
export type Piercing = keyof typeof abilityOptions.piercing;

// Fluency typing

/** Valid fields */
export type Field = keyof typeof tradecraftOptions;

/** Valid tradecrafts */
export type Tradecraft =
  | keyof typeof tradecraftOptions.artisan.tradecrafts
  | keyof typeof tradecraftOptions.mediator.tradecrafts
  | keyof typeof tradecraftOptions.scholar.tradecrafts
  | keyof typeof tradecraftOptions.survivalist.tradecrafts
  | keyof typeof tradecraftOptions.prestige.tradecrafts;

// Resource typing

/** Function hook */
export type FunctionHook = keyof typeof resourceOptions.functionHooks;

// Equipment typing

/** Equipment classes */
export type EquipmentClass = keyof typeof equipmentclasses;

/** Weapon classes */
export type WeaponClass = keyof typeof weaponclasses;

/** Weapon fighting styles */
export type WeaponFightingStyle = keyof typeof weaponFightingStyles;

/** Generic property keys */
export type GenericPropertyKey = keyof typeof properties;

/** Material property keys */
export type MaterialPropertyKey = keyof typeof materialProperties;

/** Magical property keys */
export type MagicalPropertyKey = keyof typeof magicalProperties;

// Power typing

/** Power type */
export type PowerType = keyof typeof powerOptions;

// Rank typing

/** Archetype */
export type RankArchetype = keyof typeof rankOptions;

/** Class */
export type RankClass = keyof typeof abilityOptions.class;

// Token typing

export type LightingAnimation =
  | ""
  | "witchwave"
  | "chroma"
  | "energy"
  | "fairy"
  | "torch"
  | "grid"
  | "ghost"
  | "hexa"
  | "dome"
  | "emanation"
  | "pulse"
  | "wave"
  | "radialrainbow"
  | "revolving"
  | "siren"
  | "smokepatch"
  | "reactivepulse"
  | "starlight"
  | "sunburst"
  | "fog"
  | "rainbowswirl"
  | "flame"
  | "vortex";

// General

/** Font */
export type Font = keyof typeof fonts;

/** Comparison */
export type Comparison = "=" | "!=" | ">" | "<" | ">=" | "<=";

/** Comparator */
export type Comparator = {
  key: string;
  comparison: Teriock.Comparison;
  value: any;
};
