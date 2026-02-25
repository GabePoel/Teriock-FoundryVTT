import {
  RangeModel,
  SlowExecutionTimeModel,
} from "../../../../../models/unit-models/_module.mjs";
import { EvaluationModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface AbilityUsagePartInterface {
      /** <schema> This ability's delivery */
      delivery: DeliveryConfig;
      /** <schema> This ability's execution time */
      executionTime: {
        base: Teriock.Parameters.Ability.ExecutionTime;
        slow: SlowExecutionTimeModel;
      };
      /** <schema> This ability's expansion */
      expansion: {
        /** <schema> Maximum number of extra executions */
        cap: EvaluationModel;
        /** <schema> Type of ability's expansion */
        type: Teriock.Parameters.Ability.Expansion | null;
        /** <schema> Range of expansion */
        range: RangeModel;
        /** <schema> What attribute is used for feat saves against this ability's expansion */
        featSaveAttribute: Teriock.Parameters.Actor.Attribute;
      };
      /** <schema> What attribute is used for feat saves against this ability */
      featSaveAttribute: Teriock.Parameters.Actor.Attribute;
      /** <schema> This ability's interaction */
      interaction: Teriock.Parameters.Ability.Interaction;
      /** <schema> This ability's maneuver */
      maneuver: Teriock.Parameters.Ability.Maneuver;
      /** <schema> The maximum range at which this ability can be used */
      range: RangeModel;
      /** <schema> Appropriate targets */
      targets: Set<Teriock.Parameters.Ability.Target>;
    }
  }
}

/**
 * Valid delivery packages
 */
export type DeliveryPackage =
  | "ball"
  | "ray"
  | "ritual"
  | "strike"
  | "touch"
  | null;

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

export {};
