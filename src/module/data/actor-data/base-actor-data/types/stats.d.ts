/** Bar data */
export interface BarData {
  /** Minimum */
  min: number;
  /** Maximum */
  max: number;
  /** Value */
  value: number;
}

/** Attribute data */
export interface ActorAttributeData {
  /** Value */
  value: number;
  /** Are you proficient in saves made with this attribute? */
  saveProficient: boolean;
  /** Are you fluent in saves made with this attribute? */
  saveFluent: boolean;
  /** Total bonus to saves made with this attribute */
  saveBonus: number;
}

/** Hack data */
export interface ActorHackData {
  /** Minimum */
  min: 0;
  /** Maximum */
  max: 1 | 2;
  /** Value */
  value: 0 | 1 | 2;
}
