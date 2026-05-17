declare global {
  namespace Teriock.Models {
    export type ActorHacksPartData = {
      /** <base> Hacks */
      hacks: Record<Teriock.Keys.HackableBodyPart, Foundry.BarField>;
    };
  }
}

export {};
