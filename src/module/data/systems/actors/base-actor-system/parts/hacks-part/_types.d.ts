declare global {
  namespace Teriock.Models {
    export interface ActorHacksPartData {
      /** <base> Hacks */
      hacks: Record<Teriock.Keys.HackableBodyPart, Teriock.Fields.BarField>;
    }
  }
}

export {};
