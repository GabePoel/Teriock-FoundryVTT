declare global {
  namespace Teriock.Parameters.Ability {
    /** Valid maneuvers */
    export type Maneuver = keyof typeof TERIOCK.options.ability.maneuver;

    /** Valid interactions */
    export type Interaction = keyof typeof TERIOCK.options.ability.interaction;

    /** Valid execution times for active maneuvers */
    export type ActiveExecutionTime = keyof typeof TERIOCK.options.ability.executionTime.active;

    /** Valid execution times for reactive maneuvers */
    export type ReactiveExecutionTime = keyof typeof TERIOCK.options.ability.executionTime.reactive;

    /** Valid execution times for passive maneuvers */
    export type PassiveExecutionTime = keyof typeof TERIOCK.options.ability.executionTime.passive;

    /** Valid execution times for slow maneuvers */
    export type SlowExecutionTime = | keyof typeof TERIOCK.options.ability.executionTime.slow | string;

    /** Valid execution times */
    export type ExecutionTime =
      | Teriock.Parameters.Ability.ActiveExecutionTime
      | Teriock.Parameters.Ability.ReactiveExecutionTime
      | Teriock.Parameters.Ability.PassiveExecutionTime
      | Teriock.Parameters.Ability.SlowExecutionTime;

    /**
     * Effect types
     */
    export type EffectTag = keyof typeof TERIOCK.options.ability.effects;

    /**
     * Targets
     */
    export type Target = keyof typeof TERIOCK.options.ability.targets;

    /**
     * Deliveries
     */
    export type Delivery = keyof typeof TERIOCK.options.ability.delivery;

    /**
     * Valid elements
     */
    export type Element = keyof typeof TERIOCK.options.ability.elements;

    /** Valid power sources */
    export type PowerSource = keyof typeof TERIOCK.options.ability.powerSources;

    /** Expansion */
    export type Expansion = keyof typeof TERIOCK.options.ability.expansion;

    /** Piercing */
    export type Piercing = keyof typeof TERIOCK.options.ability.piercing;
  }
}

export {};