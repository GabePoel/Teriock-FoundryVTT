declare module "./stat-die-model.mjs" {
  export default interface StatDieModel {
    stat: Teriock.Parameters.Shared.DieStat;
    faces: Teriock.RollOptions.PolyhedralDieFaces;
    spent: boolean;
    value: number;
  }
}
export {};
