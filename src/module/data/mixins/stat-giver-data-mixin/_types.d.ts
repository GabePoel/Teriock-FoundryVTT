import { StatPoolModel } from "../../models/stat-pool-model/_module.mjs";

export interface StatGiverMixinInterface {
  statDice: {
    hp: StatPoolModel;
    mp: StatPoolModel;
  };

  get parent(): TeriockChild;
}
