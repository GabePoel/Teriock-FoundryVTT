const { fields } = foundry.data;
import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";

/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockPropertyData extends WikiDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "property",
    });
  }

  /**
   * Gets the message parts for the property effect.
   * Combines base message parts with property-specific message parts.
   *
   * @returns {object} Object containing message parts for the property effect.
   * @override
   */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * Defines the schema for the property data model.
   *
   * @returns {object} The schema definition for the property data.
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      wikiNamespace: new fields.StringField({ initial: "Property", gmOnly: true }),
      propertyType: new fields.StringField({ initial: "normal" }),
      damageType: new fields.StringField({ initial: "" }),
    });
  }
}
