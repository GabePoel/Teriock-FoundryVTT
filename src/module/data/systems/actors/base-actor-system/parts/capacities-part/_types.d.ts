declare global {
  namespace Teriock.Models {
    export type ActorCapacitiesPartData = {
      carryingCapacity: {
        factor: number;
        heavy: number;
        light: number;
        max: number;
      };
      /** <base> Encumbrance level */
      encumbranceLevel: number;
      /** <schema> Size */
      size: {
        /** <derived> Named size category */
        category: string;
        /** <derived> */
        length: number;
        /** <schema> Numbered size */
        number: number;
        /** <derived> */
        reach: number;
      };
      /** <schema> Weight of the actor and what they carry */
      weight: {
        /** <derived> Total weight carried by the actor (equipment + money) */
        carried: number;
        /** <derived> Weight of the actor's equipment */
        equipment: number;
        /** <derived> Weight of the actor's money */
        money: number;
        /** <schema> Weight of the actor */
        self: number;
        /** <derived> Total weight of actor and everything they carry (self + carried) */
        value: number;
      };
    };
  }
}

export {};
