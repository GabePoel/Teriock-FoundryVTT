export default interface ActorHacksPartInterface {
  /** <base> Hacks */
  hacks: HackDataCollection;
}

/** Hack data */
export interface ActorHackData {
  /** Maximum */
  max: 1 | 2;
  /** Minimum */
  min: 0;
  /** Value */
  value: 0 | 1 | 2;
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
