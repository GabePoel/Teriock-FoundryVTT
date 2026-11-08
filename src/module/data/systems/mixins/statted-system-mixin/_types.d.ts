import { StatPoolModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface StattedSystemData {
      statDice: Record<Teriock.Keys.DieStat, StatPoolModel>;
    }
  }
}

export {};
