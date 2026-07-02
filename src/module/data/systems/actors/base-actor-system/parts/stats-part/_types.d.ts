import { Collection } from "@common/utils/_module.mjs";

import { StatDie } from "../../../../../pseudo-documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActorStatsPartData = {
      /** <schema> Hit points (damage) */
      hp: CoreStat;
      /** <schema> Lifespan points (wither) */
      lp: Foundry.BarField;
      /** <schema> Mana points (drain) */
      mp: CoreStat;
    };

    export type CoreStat = Foundry.BarField & {
      /** <base> Base */
      base: number;
      /** <special> Stat dice of this type */
      dice: Collection<ID<StatDie>, StatDie>;
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
