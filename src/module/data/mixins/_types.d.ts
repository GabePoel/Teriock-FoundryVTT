import type StatDieModel from "../shared/stat-die-model.mjs";

export interface StatDataInterface {
  /** HP Dice */
  hpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
  /** MP Dice */
  mpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
}

declare module "./stat-data-mixin.mjs" {
  // @ts-ignore
  export default class StatDataMixin implements StatDataInterface {}
}
