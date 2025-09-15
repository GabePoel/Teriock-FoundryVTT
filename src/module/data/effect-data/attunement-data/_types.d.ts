import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { TeriockAttunement, TeriockEquipment } from "../../../documents/_documents.mjs";

declare module "./attunement-data.mjs" {
  export default interface TeriockAttunementModel extends TeriockBaseEffectModel {
    /** Should this inherit the tier of the target entity? */
    inheritTier: boolean;
    /** The entity that this attunement corresponds to */
    target: Teriock.ID<TeriockEquipment> | null;
    /** Presence tier of the target entity */
    tier: number;
    /** What type of entity this attunement corresponds to */
    type: "equipment" | "mount";

    get parent(): TeriockAttunement;
  }
}
