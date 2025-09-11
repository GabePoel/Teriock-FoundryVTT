import { abilityOptions } from "../../../constants/options/ability-options.mjs";

declare global {
  namespace Teriock.Parameters.Ability {
    /** Valid maneuvers */
    export type Maneuver = keyof typeof abilityOptions.maneuver;

    /** Valid interactions */
    export type Interaction = keyof typeof abilityOptions.interaction;

    /** Valid execution times for active maneuvers */
    export type ActiveExecutionTime = keyof typeof abilityOptions.executionTime.active;

    /** Valid execution times for reactive maneuvers */
    export type ReactiveExecutionTime = keyof typeof abilityOptions.executionTime.reactive;

    /** Valid execution times for passive maneuvers */
    export type PassiveExecutionTime = keyof typeof abilityOptions.executionTime.passive;

    /** Valid execution times for slow maneuvers */
    export type SlowExecutionTime = | keyof typeof abilityOptions.executionTime.slow | string;

    /** Valid execution times */
    export type ExecutionTime =
      | Teriock.Parameters.Ability.ActiveExecutionTime
      | Teriock.Parameters.Ability.ReactiveExecutionTime
      | Teriock.Parameters.Ability.PassiveExecutionTime
      | Teriock.Parameters.Ability.SlowExecutionTime;

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
  }
}
