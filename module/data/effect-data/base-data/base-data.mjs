const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";

export class TeriockBaseEffectData extends ChildDataMixin(TypeDataModel) {
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: "<p>None.</p>" }),
      forceDisabled: new fields.BooleanField({
        initial: false,
        label: "Force Disabled"
      }),
      proficient: new fields.BooleanField({
        initial: false,
        label: "Proficient",
      }),
      fluent: new fields.BooleanField({
        initial: false,
        label: "Fluent",
      }),
    }
  }
}