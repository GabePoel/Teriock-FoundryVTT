const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { MixinChildData } from "../../mixins/child.mjs";

export class TeriockEffectData extends MixinChildData(TypeDataModel) {
  static defineSchema() {
    return {
      description: new fields.HTMLField({ initial: "<p>None.</p>" }),
      forceDisabled: new fields.BooleanField({ initial: false }),
      proficient: new fields.BooleanField({ initial: false }),
      fluent: new fields.BooleanField({ initial: false }),
    }
  }
}