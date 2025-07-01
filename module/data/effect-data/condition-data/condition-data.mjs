import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * Condition-specific effect data model.
 * Handles condition functionality including wiki integration.
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockConditionData extends WikiDataMixin(TeriockBaseEffectData) {
  /**
   * Gets the metadata for the condition data model.
   * @inheritdoc
   * @returns {object} The metadata object with condition type information.
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "condition",
    });
  }

  /**
   * Defines the schema for the condition data model.
   * @override
   * @returns {object} The schema definition for the condition data.
   */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Condition", gmOnly: true }),
    };
  }
}
