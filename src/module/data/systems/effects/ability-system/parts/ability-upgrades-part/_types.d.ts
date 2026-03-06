declare global {
  namespace Teriock.Models {
    export type AbilityUpgradesPartInterface = {
      /** <schema> Attributes that this ability upgrades */
      upgrades: {
        competence: {
          attribute: Teriock.Parameters.Actor.Attribute | null;
          value: number;
        };
        score: {
          attribute: Teriock.Parameters.Actor.StatAttribute | null;
          value: number;
        };
      };
    };
  }
}

export {};
