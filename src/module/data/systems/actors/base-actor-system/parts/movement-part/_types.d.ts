declare global {
  namespace Teriock.Models {
    export type ActorMovementPartData = {
      /** <base> Movement speed in ft / action. */
      movementSpeed: number;
      /** <base> Speed adjustments */
      speedAdjustments: Record<Teriock.Keys.Movement, Teriock.Keys.Speed>;
    };
  }
}

export {};
