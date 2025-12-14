export default interface ActorMovementPartInterface {
  movementSpeed: number;
  /** <base> Speed adjustments */
  speedAdjustments: {
    /** <base> Climb speed */
    climb: number;
    /** <base> Crawl speed */
    crawl: number;
    /** <base> Difficult terrain speed */
    difficultTerrain: number;
    /** <base> Dig speed */
    dig: number;
    /** <base> Dive speed */
    dive: number;
    /** <base> Fly speed */
    fly: number;
    /** <base> Hidden speed */
    hidden: number;
    /** <base> Horizontal leap speed */
    leapHorizontal: number;
    /** <base> Vertical leap speed */
    leapVertical: number;
    /** <base> Swim speed */
    swim: number;
    /** <base> Walk speed */
    walk: number;
  };
}
