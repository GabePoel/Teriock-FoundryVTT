declare global {
  namespace Teriock.Models {
    export interface ActorScalingPartData {
      /** <base> Presence */
      presence: Teriock.Fields.BarField & {
        /** <derived> Too much presence being used */
        overflow: boolean;
      };
      /** <base> Scaling bonuses */
      scaling: {
        /** <schema> Battle rating from species unless set */
        br: number;
        /** <schema> Scale off BR instead of LVL */
        brScale: boolean;
        /** <base> Fluency bonus derived from level */
        f: number;
        /** <schema> Level */
        lvl: number;
        /** <base> Proficiency bonus derived from level */
        p: number;
        /** <base> Total rank derived from level */
        rank: number;
        /** <base> Scaling term, either LVL or BR */
        scale: number;
      };
    }
  }
}

export {};
