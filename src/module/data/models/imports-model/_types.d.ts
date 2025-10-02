import type {
  TeriockBody,
  TeriockEquipment,
} from "../../../documents/_documents.mjs";

declare module "./imports-model.mjs" {
  export default interface ImportsModel {
    bodyParts: Set<Teriock.UUID<TeriockBody>>;
    equipment: Set<Teriock.UUID<TeriockEquipment>>;
    ranks: {
      /** <schema> General archetype ranks */
      archetypes: Record<Teriock.Parameters.Rank.RankArchetype, number>;
      /** <schema> Defined class ranks */
      classes: Record<Teriock.Parameters.Rank.RankClass, number>;
      /** <schema> Ranks of any class */
      general: number;
    };

    get parent(): TeriockCommon;
  }
}

export {};
