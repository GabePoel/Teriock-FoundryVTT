import { SuppressionModel } from "../../../models/_module.mjs";

declare module "./region-automation.mjs" {
  export default interface RegionAutomation {
    applyDocuments: boolean;
    deleteOnTurnChange: boolean;
    difficultTerrain: boolean;
    setSuppression: boolean;
    setTerrain: boolean;
    suppression: SuppressionModel;
    terrain: { terrainMode: Teriock.Keys.TerrainMode, terrains: Set<Teriock.Keys.Terrain> };
    visibility: number;
  }
}

export {};
