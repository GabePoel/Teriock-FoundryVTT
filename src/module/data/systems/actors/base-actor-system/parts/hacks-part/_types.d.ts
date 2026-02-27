export default interface ActorHacksPartInterface {
  /** <base> Hacks */
  hacks: HackDataCollection;
}

/** Hack data */
export interface ActorHackData {
  /** Maximum */
  max: number;
  /** Minimum */
  min: number;
  /** Value */
  value: number;
}

/** The types of hacks that could be applied. */
export interface HackDataCollection {
  /** Arm hacks */
  arm: ActorHackData;
  /** Body hacks */
  body: ActorHackData;
  /** Ear hacks */
  ear: ActorHackData;
  /** Eye hacks */
  eye: ActorHackData;
  /** Leg hacks */
  leg: ActorHackData;
  /** Mouth hacks */
  mouth: ActorHackData;
  /** Nose hacks */
  nose: ActorHackData;
}
