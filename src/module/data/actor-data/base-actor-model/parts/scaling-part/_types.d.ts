export default interface ActorScalingPartInterface {
  /** <base> Presence */
  presence: {
    /** <base> Maximum presence tier */
    max: number;
    /** <base> Minimum presence tier */
    min: number;
    /** <derived> Currently used presence tier */
    value: number;
    /** <derived> Too much presence being used */
    overflow: boolean;
  };
  /** <base> Scaling bonuses */
  scaling: {
    /** <base> Battle rating */
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
