declare global {
  namespace Teriock.Models {
    export type AttunementSystemData = {
      /** <schema> Should this inherit the tier of the target entity? */
      inheritTier: boolean;
      /** <schema> The entity that this attunement corresponds to */
      target: TeriockEquipment | TeriockMount | null;
      /** <schema> Presence tier of the target entity */
      tier: number;

      get parent(): TeriockAttunement;
    };
  }
}

export {};
