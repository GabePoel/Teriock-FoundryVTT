import { ChildDataMixin } from "../../mixins/_types";
import { TeriockEffect } from "@client/documents/_module.mjs";

declare module "./base-data.mjs" {
  export default interface TeriockBaseEffectData extends ChildDataMixin {
    parent: TeriockEffect;
    forceDisabled: boolean;
    deleteOnExpire: boolean;
  }
}
