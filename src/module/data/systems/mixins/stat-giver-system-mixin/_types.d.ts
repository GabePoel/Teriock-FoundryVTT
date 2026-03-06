import {
  HpPoolModel,
  MpPoolModel,
} from "../../../models/stat-pool-models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type StatGiverSystemInterface = {
      statDice: {
        hp: HpPoolModel;
        mp: MpPoolModel;
      };
    };
  }
}
