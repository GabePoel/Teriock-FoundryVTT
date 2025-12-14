import { StatDieModel } from "../../../../models/_module.mjs";

export default interface ActorStatsPartInterface {
  /** <schema> Hit points */
  hp: {
    /** <base> Base HP */
    base: number;
    /** <base> Maximum HP */
    max: number;
    /** <derived> Minimum HP */
    min: number;
    /** <schema> Morganti damaged HP */
    morganti: number;
    /** <schema> Temp HP */
    temp: number;
    /** <schema> Current HP */
    value: number;
  };
  /** <schema> Mana points */
  mp: {
    /** <base> Base MP */
    base: number;
    /** <base> Maximum MP */
    max: number;
    /** <derived> Minimum MP */
    min: number;
    /** <schema> Morganti drained MP */
    morganti: number;
    /** <schema> Temp MP */
    temp: number;
    /** <schema> Current MP */
    value: number;
  };
  statDice: {
    hp: {
      dice: StatDieModel[];
      html: string;
    };
    mp: {
      dice: StatDieModel[];
      html: string;
    };
  };
  /** <schema> Wither */
  wither: {
    /** Maximum */
    max: number;
    /** Minimum */
    min: number;
    /** Value */
    value: number;
  };
}
