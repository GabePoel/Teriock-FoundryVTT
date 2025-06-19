import { TeriockEffect } from "../../../documents/effect.mjs";
import { ChildDataMixin } from "../../mixins/_types";

declare module "./base-data.mjs" {
  export default interface TeriockBaseEffectData extends ChildDataMixin {
    parent: TeriockEffect;
    forceDisabled: boolean;
    deleteOnExpire: boolean;
  }
}
