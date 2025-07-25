import TeriockEffect from "../../../documents/effect.mjs";
import { ChildDataMixin } from "../../mixins/_types";

export interface TeriockBaseEffectSchema extends ChildDataMixin {
  /** Parent effect */
  parent: TeriockEffect;
  /**
   * Metadata that describes effects.
   */
  metadata: {
    /** Type of effect. */
    type: string;
    /** Supports sub-effects? */
    canSub?: boolean;
  };
  /** If this effect should be deleted instead of disabled when it expires */
  deleteOnExpire: boolean;
  /** Update counter - used to force an update when adding/removing effects */
  updateCounter: boolean;
}

declare module "./base-effect-data.mjs" {
  /** Redundant extension is needed for intellisense. */
  export default interface TeriockBaseEffectData
    extends TeriockBaseEffectSchema,
      ChildDataMixin {}
}
