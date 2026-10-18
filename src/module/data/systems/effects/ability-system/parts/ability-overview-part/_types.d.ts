declare global {
  namespace Teriock.Models {
    export interface AbilityOverviewPartData {
      /** <schema> Circumstances in which this ability's effect ends */
      endCondition: string;
      /** <schema> Description of how this ability changes if heightened */
      heightened: string;
      /** <schema> Description of what this ability does */
      overview: { base: string, fluent: string, proficient: string };
      /** <schema> Requirements that must be met for this ability to be used */
      requirements: string;
      /** <schema> Description of this ability's trigger */
      trigger: string;
    }
  }
}

export {};
