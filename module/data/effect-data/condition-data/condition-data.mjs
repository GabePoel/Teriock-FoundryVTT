import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockConditionData extends WikiDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "condition",
    });
  }

  /** @override */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Condition", gmOnly: true }),
    };
  }
}
