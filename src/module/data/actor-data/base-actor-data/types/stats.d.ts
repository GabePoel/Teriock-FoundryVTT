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
  /** Total bonus to saves made with this attribute */
  saveBonus: number;
  /** Are you fluent in saves made with this attribute? */
  saveFluent: boolean;
  /** Are you proficient in saves made with this attribute? */
  saveProficient: boolean;
  /** Value */
  value: number;
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
