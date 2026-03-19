declare global {
  namespace Teriock.Models {
    export type ActorHacksPartData = {
      /** <base> Hacks */
      hacks: Record<
        Teriock.Parameters.Actor.HackableBodyPart,
        Teriock.Foundry.BarField
      >;
    };
  }
}

export {};
