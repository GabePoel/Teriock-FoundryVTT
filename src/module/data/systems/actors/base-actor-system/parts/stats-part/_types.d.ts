import { StatDieModel } from "../../../../../models/_module.mjs";

export type ActorStatsPartInterface = {
  /** <schema> Hit points */
  hp: CoreStat;
  /** <schema> Mana points */
  mp: CoreStat;
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
  wither: Teriock.Foundry.BarField;
};

type CoreStat = Teriock.Foundry.BarField & {
  /** <base> Base */
  base: number;
  /** <schema> Morganti */
  morganti: number;
  /** <schema> Temp */
  temp: number;
};
