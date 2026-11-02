declare module "./terrain-system.mjs" {
  export default interface TerrainSystem {
    /** <schema> Whether this region is difficult terrain */
    difficultTerrain: boolean;
    /** <schema> Scene and level terrain types removed in this region */
    removedTerrains: Set<Teriock.Keys.Terrain>;
    /** <schema> Terrain types added in this region */
    terrains: Set<Teriock.Keys.Terrain>;
  }
}

export {};
