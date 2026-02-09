import { RangeModel } from "../../../../../models/unit-models/_module.mjs";
import { EvaluationModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface AbilityGeneralPartInterface {
      /** <schema> If this is a basic ability */
      basic: boolean;
      /** <schema> What class this ability is associated with */
      class: Teriock.Parameters.Rank.RankClass;
      /** <schema> This ability's delivery */
      delivery: DeliveryConfig;
      /**
       * <schema> Tags that describe what type of effect this ability is
       * ("effect" in the Teriock rules sense, not in the Foundry VTT sense)
       */
      effectTypes: Set<Teriock.Parameters.Ability.EffectTag>;
      /** <schema> If this ability is considered to be Elder Sorcery */
      elderSorcery: boolean;
      /** <schema> Wording of this ability's Elder Sorcery incant */
      elderSorceryIncant: string;
      /** <schema> Elements of this ability */
      elements: Set<Teriock.Parameters.Ability.Element>;
      /** <schema> Circumstances in which this ability's effect ends */
      endCondition: string;
      /** <schema> This ability's execution time */
      executionTime: Teriock.Parameters.Ability.ExecutionTime;
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
      /** <schema> The "form" of this ability (what color it would be printed on a card) */
      form: Teriock.Parameters.Shared.Form;
      /** <schema> Can only be used with the item that grants it. */
      grantOnly: boolean;
      /** <derived> Text describing this being granted. */
      grantOnlyText: string;
      /** <schema> Description of how this ability changes if heightened */
      heightened: string;
      /**
       * <schema> Description of any improvement that makes this ability better than it would otherwise be
       * (not to be confused with {@link AbilityUpgradesPart})
       */
      improvement: string;
      /** <schema> This ability's interaction */
      interaction: Teriock.Parameters.Ability.Interaction;
      /** <schema> If this ability is invoked */
      invoked: boolean;
      /** <schema> Description of any limitation that makes this ability worse than it would otherwise be */
      limitation: string;
      /** <schema> This ability's maneuver */
      maneuver: Teriock.Parameters.Ability.Maneuver;
      /** <schema> Description of what this ability does */
      overview: OverviewText;
      /** <schema> Power sources that must be available in order for this ability to work */
      powerSources: Set<Teriock.Parameters.Ability.PowerSource>;
      /** <schema> The maximum range at which this ability can be used */
      range: RangeModel;
      /** <schema> Requirements that must be met for this ability to be used */
      requirements: string;
      /** <schema> What this ability does to a target */
      results: ResultsText;
      /** <schema> If this ability is a ritual */
      ritual: boolean;
      /** <schema> If this ability is a rotator */
      rotator: boolean;
      /** <schema> If this ability is considered a "skill" */
      skill: boolean;
      /** <schema> If this ability is a spell */
      spell: boolean;
      /** <schema> If this ability is considered "standard" */
      standard: boolean;
      /** <schema> If this ability is sustained */
      sustained: boolean;
      /** <schema> What consequences this is ability is currently sustaining */
      sustaining: Set<UUID<TeriockConsequence>>;
      /** <schema> Appropriate targets */
      targets: Set<Teriock.Parameters.Ability.Target>;
      /** <schema> Description of this ability's trigger */
      trigger: string;
      /** <schema> If this ability is automatically warded */
      warded: boolean;
    }
  }
}

/**
 * Overview text for different proficiency levels
 */
export interface OverviewText {
  base: string;
  fluent: string;
  proficient: string;
}

/**
 * Results text for different outcomes
 */
export interface ResultsText {
  critFail: string;
  critHit: string;
  critMiss: string;
  critSave: string;
  fail: string;
  hit: string;
  miss: string;
  save: string;
}

/**
 * Valid expansions
 */
export type Expansion = "cascade" | "detonate" | "fork" | "ripple" | null;

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
