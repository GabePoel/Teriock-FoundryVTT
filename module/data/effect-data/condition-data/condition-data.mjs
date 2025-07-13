const { fields } = foundry.data;
import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";

/**
 * Condition-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 *
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockConditionData extends WikiDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "condition",
    });
  }

  /**
   * Defines the schema for the condition data model.
   *
   * @returns {object} The schema definition for the condition data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      wikiNamespace: new fields.StringField({ initial: "Condition", gmOnly: true }),
    });
  }
}
