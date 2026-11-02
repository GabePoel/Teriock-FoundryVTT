declare module "./region-automation.mjs" {
  export default interface RegionAutomation {
    deleteOnTurnChange: boolean;
    terrain: {
      difficultTerrain: boolean;
      removedTerrains: Set<Teriock.Keys.Terrain>;
      terrains: Set<Teriock.Keys.Terrain>;
    };
    visibility: number;
  }
}

export {};
