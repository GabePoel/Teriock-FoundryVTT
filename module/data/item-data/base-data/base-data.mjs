const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";

export default class TeriockBaseItemData extends ChildDataMixin(TypeDataModel) {

  /** @override */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      disabled: new fields.BooleanField({
        initial: false,
        label: "Disabled",
      }),
    }
  }
}