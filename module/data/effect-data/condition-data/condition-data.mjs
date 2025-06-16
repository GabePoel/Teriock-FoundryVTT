import { TeriockBaseEffectData } from "../base-data/base-data.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";

export class TeriockConditionData extends WikiDataMixin(TeriockBaseEffectData) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Condition", gmOnly: true }),
    }
  }
}