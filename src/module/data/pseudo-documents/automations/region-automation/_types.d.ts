declare module "./region-automation.mjs" {
  export default interface RegionAutomation {
    applyDocuments: boolean;
    deleteOnTurnChange: boolean;
    setTerrain: boolean;
    terrain: {
      difficultTerrain: boolean;
      terrainMode: Teriock.Keys.TerrainMode;
      terrains: Set<Teriock.Keys.Terrain>;
    };
    visibility: number;
  }
}

export {};
