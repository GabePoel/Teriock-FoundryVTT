declare module "./terrain-system.mjs" {
  export default interface TerrainSystem {
    /** <schema> How this region changes less specific terrain types */
    terrainMode: Teriock.Keys.TerrainMode;
    /** <schema> Terrain types changed in this region */
    terrains: Set<Teriock.Keys.Terrain>;
  }
}

export {};
