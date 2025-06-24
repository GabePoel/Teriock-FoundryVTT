import { ChildDataMixin } from "../../mixins/_types";
import { TeriockEffect } from "@client/documents/_module.mjs";

declare module "./base-data.mjs" {
  export default interface TeriockBaseEffectData extends ChildDataMixin {
    /** Parent effect */
    parent: TeriockEffect;
    /** Force disabled */
    forceDisabled: boolean;
    /** If this effect should be deleted instead of disabled when it expires */
    deleteOnExpire: boolean;
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
  }
}
