declare global {
  namespace Teriock.Models {
    export interface AbilityOverviewPartInterface {
      /** <schema> Circumstances in which this ability's effect ends */
      endCondition: string;
      /** <schema> Description of how this ability changes if heightened */
      heightened: string;
      /**
       * <schema> Description of any improvement that makes this ability better than it would otherwise be
       * (not to be confused with {@link AbilityUpgradesPart})
       */
      improvement: string;
      /** <schema> Description of any limitation that makes this ability worse than it would otherwise be */
      limitation: string;
      /** <schema> Description of what this ability does */
      overview: OverviewText;
      /** <schema> Requirements that must be met for this ability to be used */
      requirements: string;
      /** <schema> Description of this ability's trigger */
      trigger: string;
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

export {};
