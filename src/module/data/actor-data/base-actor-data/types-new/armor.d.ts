// noinspection JSUnusedGlobalSymbols

export type ActorArmorValue = {
  natural: {
    /** @base Base natural AV */
    base: number;
    /** @base Bonuses to natural AV (as long as you have any) */
    bonus: number;
    /** @base Total natural AV */
    value: number;
  };
  worn: {
    /** @base Base worn AV */
    base: number;
    /** @base Bonuses to worn AV (as long as you have any) */
    bonus: number;
    /** @base Total worn AV */
    value: number;
  };
  total: {
    /** @derived Base total AV. Natural value + worn value. */
    base: number;
    /** @base Other bonuses to total AV (do NOT need to have any) */
    bonus: number;
    /** @derived Total AV */
    value: number;
  };
};
