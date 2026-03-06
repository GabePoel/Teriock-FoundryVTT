declare global {
  namespace Teriock.Models {
    export interface ActorHacksPartInterface {
      /** <base> Hacks */
      hacks: Record<
        Teriock.Parameters.Actor.HackableBodyPart,
        Teriock.Foundry.BarField
      >;
    }
  }
}

export {};
