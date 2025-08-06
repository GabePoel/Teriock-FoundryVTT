import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import * as parsing from "./methods/_parsing.mjs";
import { _suppressed } from "./methods/_suppression.mjs";

const { fields } = foundry.data;

/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockPropertyData extends WikiDataMixin(
  TeriockBaseEffectData,
) {
  /**
   * Metadata for this effect.
   *
   * @type {Readonly<Teriock.EffectDataModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    hierarchy: false,
    namespace: "Property",
    pageNameKey: "name",
    type: "property",
    usable: false,
    wiki: true,
  });

  /**
   * Checks if the property is suppressed.
   * Combines base suppression with property-specific suppression logic.
   *
   * @returns {boolean} True if the property is suppressed, false otherwise.
   * @override
   */
  get suppressed() {
    let suppressed = super.suppressed;
    suppressed = suppressed || _suppressed(this);
    return suppressed;
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
   * Migrates property data to the current schema version.
   *
   * @param {object} data - The data to migrate.
   * @returns {object} The migrated data.
   * @override
   */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Defines the schema for the property data model.
   *
   * @returns {object} The schema definition for the property data.
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      wikiNamespace: new fields.StringField({
        initial: "Property",
      }),
      form: new fields.StringField({ initial: "normal" }),
      damageType: new fields.StringField({ initial: "" }),
    });
  }

  /**
   * Parses raw HTML content for the property.
   *
   * @param {string} rawHTML - The raw HTML content to parse.
   * @returns {Promise<object>} Promise that resolves to the parsed HTML content.
   * @override
   */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }
}
