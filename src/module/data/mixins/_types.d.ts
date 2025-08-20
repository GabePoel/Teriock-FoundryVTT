import type StatDieModel from "../shared/stat-die-model.mjs";

type BaseDice = {
  faces: number;
  number: number;
};

export interface StatDataInterface {
  /** Base HP dice */
  hpDiceBase: BaseDice;
  /** Base MP dice */
  mpDiceBase: BaseDice;
  /** HP Dice */
  hpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
  /** MP Dice */
  mpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
}

declare module "./stat-data-mixin.mjs" {
  // @ts-ignore
  export default class StatDataMixin implements StatDataInterface {}
}
