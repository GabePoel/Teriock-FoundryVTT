import type TeriockBaseEffectData from "../base-data/base-data.mjs";
import { TeriockAttunement } from "../../../types/documents";

declare module "./attunement-data.mjs" {
  export default interface TeriockAttunementData extends TeriockBaseEffectData {
    parent: TeriockAttunement;
    /** What type of entity this attunement corresponds to */
    type: "equipment" | "mount";
    /** The entity that this attunement corresponds to */
    target: string | null;
  }
}
