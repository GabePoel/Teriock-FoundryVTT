import {
  HpPoolModel,
  MpPoolModel,
} from "../../../models/stat-pool-models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type StatGiverSystemData = {
      statDice: {
        hp: HpPoolModel;
        mp: MpPoolModel;
      };
    };
  }
}
