import { TeriockBaseEffectData } from "../base-effect-data/base-effect-data.mjs";

interface TeriockAttunementSchema {
  /** What type of entity this attunement corresponds to */
  type: "equipment" | "mount";
  /** The entity that this attunement corresponds to */
  target: string | null;
  /** Should this inherit the tier of the target entity */
  inheritTier: boolean;
  /** Presence tier of the target entity */
  tier: number;
}

declare module "./attunement-data.mjs" {
  export default interface TeriockAttunementData extends TeriockAttunementSchema, TeriockBaseEffectData {}
}
