import { StatPoolModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface StatGiverSystemData {
      statDice: Record<Teriock.Keys.DieStat, StatPoolModel>;
    }
  }
}

export {};
