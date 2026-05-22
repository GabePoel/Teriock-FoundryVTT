declare global {
  namespace Teriock.Models {
    export type AbilityUpgradesPartData = {
      /** <schema> Attributes that this ability upgrades */
      upgrades: {
        competence: { attribute: Teriock.Keys.Attribute | null, value: number };
        score: { attribute: Teriock.Keys.StatAttribute | null, value: number };
      };
    };
  }
}

export {};
