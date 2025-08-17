import type TeriockBaseItemData from "../item-data/base-item-data/base-item-data.mjs";

declare module "./stat-die.mjs" {
  export default interface StatDieModel {
    parent: TeriockBaseItemData;
    stat: Teriock.Parameters.Shared.DieStat;
    faces: Teriock.RollOptions.PolyhedralDieFaces;
    spent: boolean;
    value: number;
  }
}
