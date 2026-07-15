import { StatPoolModel } from "../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type StatGiverSystemData = { statDice: Record<Teriock.Keys.DieStat, StatPoolModel> };
  }
}
