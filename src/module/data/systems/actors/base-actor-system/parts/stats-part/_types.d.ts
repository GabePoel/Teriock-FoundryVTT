import { StatDieModel } from "../../../../../models/_module.mjs";
import { Collection } from "@common/utils/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActorStatsPartData = {
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

    export type CoreStat = Teriock.Foundry.BarField & {
      /** <special> Dice not in a collection */
      _dice: StatDieModel[];
      /** <base> Base */
      base: number;
      /** <special> Stat dice of this type */
      dice: Collection<ID<StatDieModel>, StatDieModel>;
      /** <schema> Morganti */
      morganti: number;
      /** <base> Number of stat pools that this can have from ranks */
      poolLimit: number;
      /** <schema> Temp */
      temp: number;
    };
  }
}

export {};
