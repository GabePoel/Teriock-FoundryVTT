import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";
import {
  TeriockAttunement,
  TeriockEquipment,
} from "../../../documents/_documents.mjs";

declare module "./attunement-model.mjs" {
  export default interface TeriockAttunementModel
    extends TeriockBaseEffectModel {
    /** <schema> Should this inherit the tier of the target entity? */
    inheritTier: boolean;
    /** <schema> The entity that this attunement corresponds to */
    target: Teriock.ID<TeriockEquipment> | null;
    /** <schema> Presence tier of the target entity */
    tier: number;
    /** <schema> What type of entity this attunement corresponds to */
    type: Teriock.Parameters.Attunement.AttunementType;

    get parent(): TeriockAttunement;
  }
}
