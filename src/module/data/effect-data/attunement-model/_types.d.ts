import "./_parameters";

declare global {
  namespace Teriock.Models {
    export interface TeriockAttunementModelInterface
      extends Teriock.Models.TeriockBaseEffectModelInterface {
      /** <schema> Should this inherit the tier of the target entity? */
      inheritTier: boolean;
      /** <schema> The entity that this attunement corresponds to */
      target: ID<TeriockEquipment | TeriockMount> | null;
      /** <schema> Presence tier of the target entity */
      tier: number;
      /** <schema> What type of entity this attunement corresponds to */
      type: Teriock.Parameters.Attunement.AttunementType;

      get parent(): TeriockAttunement;
    }
  }
}
