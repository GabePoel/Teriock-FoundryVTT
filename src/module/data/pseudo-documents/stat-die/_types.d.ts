import { StatDie } from "../_module.mjs";
import { StatPoolModel } from "../../models/stat-pool-models/_module.mjs";

declare global {
  namespace Teriock.StatDie {
    export type StatDieModelData = { _id: ID<StatDie>, faces: number, index: number, get parent(): StatPoolModel };
  }
}

export {};
