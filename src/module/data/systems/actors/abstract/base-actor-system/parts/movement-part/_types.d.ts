declare global {
  namespace Teriock.Models {
    export interface ActorMovementPartData {
      /** <base> Whether this is in difficult terrain */
      difficultTerrain: boolean;
      /** <schema> Movement speed in ft / action */
      movementSpeed: number | null;
      /** <base> Speed adjustments */
      speedAdjustments: Record<Teriock.Keys.Movement, Teriock.Keys.Speed>;
      /** <base> The types of terrain this is in */
      terrains: Set<Teriock.Keys.Terrain>;
    }
  }
}

export {};
