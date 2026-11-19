declare global {
  namespace Teriock.Models {
    export interface ActorScalingPartData {
      /** <base> Presence */
      presence: Teriock.Fields.BarField & {
        /** <derived> Too much presence being used */
        over: boolean;
        /** <derived> Presence used without being capped by the maximum */
        total: number;
      };
      /** <base> Scaling bonuses */
      scaling: {
        /** <schema> What bonuses scale off of */
        basis: "br" | "lvl";
        /** <schema> Battle rating from species unless set */
        br: number;
        /** <base> Fluency bonus derived from scale */
        f: number;
        /** <schema> Level */
        lvl: number;
        /** <base> Proficiency bonus derived from scale */
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
