// Allows for typing within mixin.
/** @import TypeDataModel from "@common/abstract/type-data.mjs" */
const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";

/**
 * @extends {TypeDataModel}
 */
export default class TeriockBaseEffectData extends ChildDataMixin(TypeDataModel) {
  /** @override */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      forceDisabled: new fields.BooleanField({
        initial: false,
        label: "Force Disabled",
      }),
    };
  }
}
