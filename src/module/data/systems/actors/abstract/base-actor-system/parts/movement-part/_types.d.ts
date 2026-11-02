declare global {
  namespace Teriock.Models {
    export interface ActorMovementPartData {
      /** <base> Whether this is in difficult terrain */
      difficultTerrain: boolean;
      /** <base> Movement speed in ft / action. */
      movementSpeed: number;
      /** <base> Speed adjustments */
      speedAdjustments: Record<Teriock.Keys.Movement, Teriock.Keys.Speed>;
      /** <base> The types of terrain this is in */
      terrains: Set<Teriock.Keys.Terrain>;
    }
  }
}

export {};
