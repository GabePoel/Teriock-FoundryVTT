declare module "./stat-die-model.mjs" {
  export default interface StatDieModel {
    stat: Teriock.Parameters.Shared.DieStat;
    faces: Teriock.RollOptions.PolyhedralDieFaces;
    spent: boolean;
    value: number;
  }
}

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

declare module "./child-data-model.mjs" {
  export default interface ChildDataModel {}
}
