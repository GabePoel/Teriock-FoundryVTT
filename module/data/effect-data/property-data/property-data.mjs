const { fields } = foundry.data;
import { _messageParts } from "./methods/_messages.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * Property-specific effect data model.
 * Handles property functionality including damage types and wiki integration.
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockPropertyData extends WikiDataMixin(TeriockBaseEffectData) {
  /**
   * Gets the metadata for the property data model.
   * @inheritdoc
   * @returns {object} The metadata object with property type information.
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "property",
    });
  }

  /**
   * Gets the message parts for the property effect.
   * Combines base message parts with property-specific message parts.
   * @override
   * @returns {object} Object containing message parts for the property effect.
   */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * Defines the schema for the property data model.
   * @returns {object} The schema definition for the property data.
   */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Property", gmOnly: true }),
      propertyType: new fields.StringField({ initial: "normal" }),
      damageType: new fields.StringField({ initial: "" }),
    };
  }
}
