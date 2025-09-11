/**
 * Valid expansions
 */
export type Expansion = "cascade" | "detonate" | "fork" | "ripple" | null;

/**
 * Valid delivery packages
 */
export type DeliveryPackage = | "ball" | "ray" | "ritual" | "strike" | "touch" | null;

/**
 * Valid delivery parents
 */
export type DeliveryParent = "item" | null;

/**
 * Delivery configuration
 */
export interface DeliveryConfig {
  base: Teriock.Parameters.Ability.Delivery;
  package: DeliveryPackage;
  parent: DeliveryParent;
}
