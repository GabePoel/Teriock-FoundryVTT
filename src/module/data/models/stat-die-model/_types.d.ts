declare module "./stat-die-model.mjs" {
  export default interface StatDieModel {
    faces: Teriock.RollOptions.PolyhedralDieFaces;
    spent: boolean;
    stat: Teriock.Parameters.Shared.DieStat;
    value: number;
  }
}
export {};
