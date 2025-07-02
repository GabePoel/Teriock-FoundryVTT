/** @import { MessageParts } from "../../../types/messages" */
import { _defineSchema } from "./methods/schema/_schema.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _roll } from "./methods/_rolling.mjs";
import { _suppressed } from "./methods/_suppression.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * Ability-specific effect data model.
 * Handles ability functionality including rolling, parsing, and wiki integration.
 * @extends {TeriockBaseEffectData}
 * @extends {WikiDataMixin}
 */
export default class TeriockAbilityData extends WikiDataMixin(TeriockBaseEffectData) {
  /**
   * Gets the metadata for the ability data model.
   * @inheritdoc
   * @returns {object} The metadata object with ability type information.
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "ability",
    });
  }

  /**
   * Defines the schema for the ability data model.
   * @override
   * @returns {object} The schema definition for the ability data.
   */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      ..._defineSchema(),
    };
  }

  /**
   * Prepares derived data for the ability, calculating computed values.
   * @override
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    _prepareDerivedData(this);
  }

  /**
   * Migrates ability data to the current schema version.
   * @override
   * @param {object} data - The data to migrate.
   * @returns {object} The migrated data.
   */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Checks if the ability is suppressed.
   * Combines base suppression with ability-specific suppression logic.
   * @override
   * @returns {boolean} True if the ability is suppressed, false otherwise.
   */
  get suppressed() {
    let suppressed = super.suppressed;
    suppressed = suppressed || _suppressed(this);
    return suppressed;
  }

  /**
   * Rolls the ability with the specified options.
   * @override
   * @param {CommonRollOptions} options - Options for the ability roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   */
  async roll(options) {
    return await _roll(this, options);
  }

  /**
   * Gets the message parts for the ability.
   * Combines base message parts with ability-specific message parts.
   * @override
   * @returns {MessageParts} Object containing message parts for the ability.
   */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /**
   * Gets the wiki page URL for the ability.
   * @override
   * @returns {string} The wiki page URL for the ability.
   */
  get wikiPage() {
    return `${this.wikiNamespace}:${this.parent.name}`;
  }

  /**
   * Parses raw HTML content for the ability.
   * @override
   * @param {string} rawHTML - The raw HTML content to parse.
   * @returns {Promise<object>} Promise that resolves to the parsed ability data.
   */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }
}
