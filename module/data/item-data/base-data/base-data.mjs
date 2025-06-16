const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";

export class TeriockBaseItemData extends ChildDataMixin(TypeDataModel) {
  static defineSchema() {
    return {
      description: new fields.HTMLField(),
      disabled: new fields.BooleanField({ initial: false }),
      font: new fields.StringField({ initial: "" }),
      proficient: new fields.BooleanField({ initial: false }),
      fluent: new fields.BooleanField({ initial: false }),
    }
  }
}