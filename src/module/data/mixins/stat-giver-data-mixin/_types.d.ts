import { StatPoolModel } from "../../models/stat-pool-models/_module.mjs";

export interface StatGiverMixinInterface {
  statDice: {
    hp: StatPoolModel;
    mp: StatPoolModel;
  };

  get parent(): TeriockChild;
}
