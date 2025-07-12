import { _defineSchema } from "./methods/schema/_schema.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _roll } from "./methods/rolling/_rolling.mjs";
import { _suppressed } from "./methods/_suppression.mjs";
import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";

/**
 * Ability-specific effect data model.
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockAbilityData extends WikiDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "ability",
    });
  }

  /**
   * Checks if the ability is suppressed.
   * Combines base suppression with ability-specific suppression logic.
   * @returns {boolean} True if the ability is suppressed, false otherwise.
   * @override
   */
  get suppressed() {
    let suppressed = super.suppressed;
    suppressed = suppressed || _suppressed(this);
    return suppressed;
  }

  /**
   * Gets the message parts for the ability.
   * Combines base message parts with ability-specific message parts.
   * @returns {Teriock.MessageParts} Object containing message parts for the ability.
   * @override
   */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /**
   * Gets the wiki page URL for the ability.
   * @returns {string} The wiki page URL for the ability.
   * @override
   */
  get wikiPage() {
    return `${this.wikiNamespace}:${this.parent.name}`;
  }

  /**
   * Defines the schema for the ability data model.
   * @returns {object} The schema definition for the ability data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), _defineSchema());
  }

  /**
   * Migrates ability data to the current schema version.
   * @param {object} data - The data to migrate.
   * @returns {object} The migrated data.
   * @override
   */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
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
   * Rolls the ability with the specified options.
   * @param {Teriock.CommonRollOptions} options - Options for the ability roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll(options) {
    return await _roll(this, options);
  }

  /**
   * Parses raw HTML content for the ability.
   * @param {string} rawHTML - The raw HTML content to parse.
   * @returns {Promise<object>} Promise that resolves to the parsed ability data.
   * @override
   */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }
}
