declare module "./terrain-system.mjs" {
  export default interface TerrainSystem {
    /** <schema> Whether this region is difficult terrain */
    difficultTerrain: boolean;
    /** <schema> Terrain types in this region */
    terrains: Set<Teriock.Keys.Terrain>;
  }
}

export {};
