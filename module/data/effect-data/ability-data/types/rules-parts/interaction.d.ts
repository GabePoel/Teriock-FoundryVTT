/**
 * Valid interaction types for abilities
 */
export type AbilityInteraction = "attack" | "feat" | "block" | "manifest";

/**
 * Valid feat save attributes
 */
export type FeatSaveAttribute = "int" | "mov" | "per" | "snk" | "str" | "unp";

/**
 * Valid expansions
 */
export type Expansion = "cascade" | "detonate" | "fork" | "ripple" | null;

/**
 * Valid piercing types
 */
export type PiercingType = "normal" | "av0" | "ub";

/**
 * Valid target types
 */
export type TargetType =
  | "ability"
  | "area"
  | "arm"
  | "armor"
  | "attack"
  | "creature"
  | "item"
  | "leg"
  | "self"
  | "ship"
  | "skill"
  | "spell"
  | "vitals"
  | "weapon"
  | "other"

/**
 * Valid delivery methods
 */
export type DeliveryMethod =
  | "armor"
  | "aura"
  | "bite"
  | "cone"
  | "hand"
  | "item"
  | "missile"
  | "self"
  | "sight"
  | "shield"
  | "weapon"
  | "other";

/**
 * Valid delivery packages
 */
export type DeliveryPackage = "ball" | "ray" | "ritual" | "strike" | "touch" | null;

/**
 * Valid delivery parents
 */
export type DeliveryParent = "item" | null;

/**
 * Delivery configuration
 */
export interface DeliveryConfig {
  base: DeliveryMethod;
  parent: DeliveryParent;
  package: DeliveryPackage;
}