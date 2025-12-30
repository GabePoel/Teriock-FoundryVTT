export default interface ActorCombatPartInterface {
  /** <schema> Stuff that changes during combat */
  combat: {
    /** <schema> Attack penalty */
    attackPenalty: number;
    /** <schema> Whether {@link TeriockActor} still has reaction */
    hasReaction: boolean;
  };
  /** <base> Defense */
  defense: {
    /** <base> Armor value */
    av: {
      /** <base> Base worn armor value */
      base: number;
      /** <base> Natural armor value */
      natural: number;
      /** <derived> Armor value */
      value: number;
      /** <derived> Worn armor value */
      worn: number;
    };
    /** <derived> Armor class (av + 10) */
    ac: number;
    /** <derived> Block value of primary blocker */
    bv: number;
    /** <derived> Combat class (ac + bv) */
    cc: number;
  };
  /** <schema> Initiative */
  initiative: string;
  /** <schema> Offense */
  offense: {
    /** <schema> Style bonus */
    sb: boolean;
    /** <schema> Piercing type */
    piercing: "av0" | "ub" | "none";
  };
  /** <schema> Wielding */
  wielding: {
    /** <schema> Primary attacker ID */
    attacker: ID<TeriockEquipment> | null;
    /** <schema> Primary blocker ID */
    blocker: ID<TeriockEquipment> | null;
  };
}
