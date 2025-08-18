import type StatDieModel from "../shared/stat-die.mjs";

export interface ChildDataInterface {
  /** Forced Proficient */
  proficient: boolean;
  /** Forced Fluent */
  fluent: boolean;
  /** Font */
  font: Teriock.Parameters.Shared.Font;
  /** Description */
  description: string;
}

export interface StatDataInterface {
  /** HP Dice */
  hpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
  /** MP Dice */
  mpDice: Record<Teriock.ID<StatDieModel>, StatDieModel>;
}

// declare module "./child-data-mixin.mjs" {
//   // @ts-ignore
//   export default class ChildDataModel implements ChildDataInterface {}
// }

declare module "./stat-data-mixin.mjs" {
  // @ts-ignore
  export default class StatDataMixin implements StatDataInterface {}
}
