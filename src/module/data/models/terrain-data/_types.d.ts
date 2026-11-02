declare module "./terrain-data.mjs" {
  export default interface TeriockTerrainData {
    difficultTerrain: boolean;
    terrains: Set<Teriock.Keys.Terrain>;
  }
}

export {};
