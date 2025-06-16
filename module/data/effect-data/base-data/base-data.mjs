const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";

export class TeriockBaseEffectData extends ChildDataMixin(TypeDataModel) {
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: "<p>None.</p>" }),
      forceDisabled: new fields.BooleanField({ initial: false }),
      proficient: new fields.BooleanField({ initial: false }),
      fluent: new fields.BooleanField({ initial: false }),
    }
  }
}