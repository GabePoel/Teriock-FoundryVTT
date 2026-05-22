import { StatDieModel } from "../_module.mjs";
import { StatPoolModel } from "../stat-pool-models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type StatDieModelData = { _id: ID<StatDieModel>, faces: number, index: number, get parent(): StatPoolModel };
  }
}

export {};
