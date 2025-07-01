/** @import { MessageParts } from "../../../types/messages" */
import { ConsumableDataMixin } from "../../mixins/consumable-mixin.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
import * as attunement from "./methods/_attunement.mjs";
import * as deriving from "./methods/_data-deriving.mjs";
import * as handling from "./methods/_handling.mjs";
import * as identifying from "./methods/_identifying.mjs";
import * as messages from "./methods/_messages.mjs";
import * as migrate from "./methods/_migrate-data.mjs";
import * as parsing from "./methods/_parsing.mjs";
import * as rolling from "./methods/_rolling.mjs";
import * as schema from "./methods/_schema.mjs";
import TeriockBaseItemData from "../base-data/base-data.mjs";

/**
 * Equipment-specific item data model.
 * Handles equipment functionality including attunement, identification, handling, and wiki integration.
 * @extends {TeriockBaseItemData}
 */
export default class TeriockEquipmentData extends WikiDataMixin(ConsumableDataMixin(TeriockBaseItemData)) {
  /**
   * Gets the metadata for the equipment data model.
   * @inheritdoc
   * @returns {object} The metadata object with equipment type information.
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "equipment",
    });
  }

  /**
   * Defines the schema for the equipment data model.
   * @override
   * @returns {object} The schema definition for the equipment data.
   */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      ...schema._defineSchema(),
    };
  }

  /**
   * Prepares derived data for the equipment.
   * @override
   * @returns {void}
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    deriving._prepareDerivedData(this);
  }

  /**
   * Migrates data from older versions to the current format.
   * @override
   * @param {object} data - The data to migrate.
   * @returns {object} The migrated data.
   */
  static migrateData(data) {
    data = migrate._migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Gets the wiki page URL for the equipment.
   * @override
   * @returns {string} The wiki page URL for the equipment type.
   */
  get wikiPage() {
    return `Equipment:${this.equipmentType}`;
  }

  /**
   * Uses one unit of the equipment.
   * If consumable and quantity reaches 0, unequips the item.
   * @override
   * @returns {Promise<void>} Promise that resolves when the equipment is used.
   */
  async useOne() {
    await super.useOne();
    if (this.consumable && this.quantity <= 0) {
      await this.unequip();
    }
  }

  /**
   * Parses raw HTML content for the equipment.
   * @override
   * @param {string} rawHTML - The raw HTML content to parse.
   * @returns {Promise<string>} Promise that resolves to the parsed HTML content.
   */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }

  /**
   * Rolls the equipment with the specified options.
   * @override
   * @param {object} options - Options for the equipment roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   */
  async roll(options) {
    await rolling._roll(this, options);
  }

  /**
   * Gets the message parts for the equipment.
   * @override
   * @returns {MessageParts} Object containing message parts for the equipment.
   */
  get messageParts() {
    return {
      ...super.messageParts,
      ...messages._messageParts(this),
    };
  }

  /**
   * Gets the secret message parts for the equipment.
   * @override
   * @returns {MessageParts} Object containing secret message parts for the equipment.
   */
  get secretMessageParts() {
    return {
      ...super.secretMessageParts,
      ...messages._secretMessageParts(this),
    };
  }

  /**
   * Shatters the equipment, making it unusable.
   * @returns {Promise<void>} Promise that resolves when the equipment is shattered.
   */
  async shatter() {
    await handling._shatter(this);
  }

  /**
   * Repairs the equipment, making it usable again.
   * @returns {Promise<void>} Promise that resolves when the equipment is repaired.
   */
  async repair() {
    await handling._repair(this);
  }

  /**
   * Sets the shattered state of the equipment.
   * @param {boolean} bool - Whether the equipment should be shattered.
   * @returns {Promise<void>} Promise that resolves when the shattered state is set.
   */
  async setShattered(bool) {
    await handling._setShattered(this, bool);
  }

  /**
   * Toggles the shattered state of the equipment.
   * @returns {Promise<void>} Promise that resolves when the shattered state is toggled.
   */
  async toggleShattered() {
    await handling._toggleShattered(this);
  }

  /**
   * Dampens the equipment, reducing its effectiveness.
   * @returns {Promise<void>} Promise that resolves when the equipment is dampened.
   */
  async dampen() {
    await handling._dampen(this);
  }

  /**
   * Removes dampening from the equipment.
   * @returns {Promise<void>} Promise that resolves when the equipment is undampened.
   */
  async undampen() {
    await handling._undampen(this);
  }

  /**
   * Sets the dampened state of the equipment.
   * @param {boolean} bool - Whether the equipment should be dampened.
   * @returns {Promise<void>} Promise that resolves when the dampened state is set.
   */
  async setDampened(bool) {
    await handling._setDampened(this, bool);
  }

  /**
   * Toggles the dampened state of the equipment.
   * @returns {Promise<void>} Promise that resolves when the dampened state is toggled.
   */
  async toggleDampened() {
    await handling._toggleDampened(this);
  }

  /**
   * Unequips the equipment from its current slot.
   * @returns {Promise<void>} Promise that resolves when the equipment is unequipped.
   */
  async unequip() {
    await handling._unequip(this);
  }

  /**
   * Equips the equipment to an appropriate slot.
   * @returns {Promise<void>} Promise that resolves when the equipment is equipped.
   */
  async equip() {
    await handling._equip(this);
  }

  /**
   * Sets the equipped state of the equipment.
   * @param {boolean} bool - Whether the equipment should be equipped.
   * @returns {Promise<void>} Promise that resolves when the equipped state is set.
   */
  async setEquipped(bool) {
    await handling._setEquipped(this, bool);
  }

  /**
   * Toggles the equipped state of the equipment.
   * @returns {Promise<void>} Promise that resolves when the equipped state is toggled.
   */
  async toggleEquipped() {
    await handling._toggleEquipped(this);
  }

  /**
   * Removes identification from the equipment.
   * @returns {Promise<void>} Promise that resolves when the equipment is unidentified.
   */
  async unidentify() {
    await identifying._unidentify(this);
  }

  /**
   * Reads magic on the equipment to reveal its properties.
   * @returns {Promise<void>} Promise that resolves when magic reading is complete.
   */
  async readMagic() {
    await identifying._readMagic(this);
  }

  /**
   * Identifies the equipment, revealing all its properties.
   * @returns {Promise<void>} Promise that resolves when the equipment is identified.
   */
  async identify() {
    await identifying._identify(this);
  }

  /**
   * Attunes the equipment to the current character.
   * @returns {Promise<TeriockEffect | null>} Promise that resolves to the attunement effect or null.
   */
  async attune() {
    return await attunement._attune(this);
  }

  /**
   * Removes attunement from the equipment.
   * @returns {Promise<void>} Promise that resolves when the equipment is deattuned.
   */
  async deattune() {
    await attunement._deattune(this);
  }

  /**
   * Checks if the equipment is currently attuned.
   * @returns {boolean} True if the equipment is attuned, false otherwise.
   */
  get attuned() {
    return attunement._attuned(this);
  }

  /**
   * Gets the current attunement data for the equipment.
   * @returns {TeriockAttunementData | null} The attunement data or null if not attuned.
   */
  get attunement() {
    return attunement._getAttunement(this);
  }
}
