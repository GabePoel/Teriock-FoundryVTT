import { insertElderSorceryMask } from "../../../helpers/html.mjs";
import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { _generateChanges } from "./methods/_generate-changes.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _suppressed } from "./methods/_suppression.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _roll } from "./methods/rolling/_rolling.mjs";
import { _defineSchema } from "./methods/schema/_schema.mjs";

/**
 * Ability-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 *
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockAbilityData extends WikiDataMixin(
  TeriockBaseEffectData,
) {
  /**
   * Metadata for this effect.
   *
   * @type {Readonly<Teriock.EffectDataModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    hierarchy: true,
    namespace: "Ability",
    pageNameKey: "name",
    type: "ability",
    usable: true,
    wiki: true,
  });

  /**
   * Checks if the ability is suppressed.
   * Combines base suppression with ability-specific suppression logic.
   *
   * @returns {boolean} True if the ability is suppressed, false otherwise.
   * @override
   */
  get suppressed() {
    let suppressed = super.suppressed;
    suppressed = suppressed || _suppressed(this);
    return suppressed;
  }

  /** @inheritDoc */
  get useText() {
    if (this.spell) return `Cast ${this.parent.name}`;
    return super.useText;
  }

  /** @inheritDoc */
  get useIcon() {
    if (this.interaction === "attack") return "dice-d20";
    if (this.interaction === "block") return "shield";
    return CONFIG.TERIOCK.documentOptions.ability.icon;
  }

  /**
   * Gets the message parts for the ability.
   * Combines base message parts with ability-specific message parts.
   *
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
   * Gets the changes this ability would provide.
   *
   * @returns {EffectChangeData[]}
   */
  get changes() {
    return _generateChanges(this);
  }

  /**
   * Defines the schema for the ability data model.
   *
   * @returns {object} The schema definition for the ability data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), _defineSchema());
  }

  /**
   * Migrates ability data to the current schema version.
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
   * Prepares derived data for the ability, calculating computed values.
   *
   * @override
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    _prepareDerivedData(this);
  }

  /**
   * Rolls the ability with the specified options.
   *
   * @param {Teriock.CommonRollOptions} options - Options for the ability roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll(options) {
    return await _roll(this, options);
  }

  /**
   * Parses raw HTML content for the ability.
   *
   * @param {string} rawHTML - The raw HTML content to parse.
   * @returns {Promise<object>} Promise that resolves to the parsed ability data.
   * @override
   */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  /**
   * Cause all consequences this is sustaining to expire.
   *
   * @param {boolean} force - Force consequences to expire even if this isn't suppressed.
   */
  async expireSustainedConsequences(force = false) {
    if (this.parent.isSuppressed || this.parent.disabled || force) {
      const activeGm = /** @type {TeriockUser} */ game.users.activeGM;
      for (const uuid of this.sustaining) {
        await activeGm.query("teriock.sustainedExpiration", {
          sustainedUuid: uuid,
        });
      }
      try {
        await this.parent.update({ "system.sustaining": new Set() });
      } catch {}
    }
  }

  /**
   * Adjust the built message after it's created.
   * Includes custom styling for Elder Sorcery.
   *
   * @param {HTMLDivElement} messageElement - The raw message HTML.
   * @returns {HTMLDivElement} The modified raw message HTML.
   * @override
   */
  adjustMessage(messageElement) {
    messageElement = super.adjustMessage(messageElement);
    messageElement = insertElderSorceryMask(messageElement, this.parent);
    return messageElement;
  }
}
