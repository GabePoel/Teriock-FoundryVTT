import { TeriockEffect } from "../../../documents/_module.mjs";
import { ChildDataMixin } from "../../mixins/_types";

declare module "./base-data.mjs" {
  export default interface TeriockBaseEffectData extends ChildDataMixin {
    parent: TeriockEffect;
    forceDisabled: boolean;
  }
}
