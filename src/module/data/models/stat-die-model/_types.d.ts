declare module "./stat-die-model.mjs" {
  export default interface StatDieModel {
    /** <schema> Stat die ID */
    _id: Teriock.ID<StatDieModel>;
    /** <schema> Number of die faces */
    faces: Teriock.RollOptions.PolyhedralDieFaces;
    /** <schema> If this die is spent */
    spent: boolean;
    /** <schema> What stat this die is for */
    stat: Teriock.Parameters.Shared.DieStat;
    /** <schema> The amount this die contributes to the total value of the stat it corresponds to */
    value: number;
  }
}

export {};
