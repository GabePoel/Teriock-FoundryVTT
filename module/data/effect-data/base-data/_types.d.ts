import { ChildDataMixin } from "../../mixins/_types";
import { TeriockEffect } from "@client/documents/_module.mjs";

declare module "./base-data.mjs" {
  interface TeriockBaseEffectData extends ChildDataMixin {
    /** Parent effect */
    parent: TeriockEffect;
    /** If this effect should be deleted instead of disabled when it expires */
    deleteOnExpire: boolean;
    /** Update counter - used to force an update when adding/removing effects */
    updateCounter: boolean;
  }

  const TeriockBaseEffectData: {
    prototype: TeriockBaseEffectData;
  };

  export default TeriockBaseEffectData;
}
