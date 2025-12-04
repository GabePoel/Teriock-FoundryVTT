import { EvaluationModel } from "../../../models/_module.mjs";

/** Bar data */
export interface BarData {
  /** Maximum */
  max: number;
  /** Minimum */
  min: number;
  /** Value */
  value: number;
}

/** Attribute data */
export interface ActorAttributeData {
  /** <derived> Passive attribute value */
  passive: EvaluationModel;
  /** <derived> Total bonus to saves made with this attribute */
  saveBonus: number;
  /** <schema> Are you fluent in saves made with this attribute? */
  saveFluent: boolean;
  /** <schema> Are you proficient in saves made with this attribute? */
  saveProficient: boolean;
  /** <schema> Value */
  score: EvaluationModel;
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
