import { TeriockEffectData } from "../base/base.mjs";
import { MixinWikiData } from "../../mixins/wiki.mjs";

export class TeriockConditionData extends MixinWikiData(TeriockEffectData) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Condition", gmOnly: true }),
    }
  }
}