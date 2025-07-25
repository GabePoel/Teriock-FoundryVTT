import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { TeriockAttunement } from "../../../documents/_documents.mjs";

interface TeriockAttunementSchema extends TeriockBaseEffectData {
  /** What type of entity this attunement corresponds to */
  type: "equipment" | "mount";
  /** The entity that this attunement corresponds to */
  target: string | null;
  /** Should this inherit the tier of the target entity */
  inheritTier: boolean;
  /** Presence tier of the target entity */
  tier: number;
  /** Parent */
  parent: TeriockAttunement;
}

declare module "./attunement-data.mjs" {
  export default interface TeriockAttunementData
    extends TeriockAttunementSchema {}
}
