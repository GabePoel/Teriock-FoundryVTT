import { createProperty } from "../../../helpers/create-effects.mjs";
import ConsumableDataMixin from "../../mixins/consumable-mixin.mjs";
import WikiDataMixin from "../../mixins/wiki-mixin.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import * as attunement from "./methods/_attunement.mjs";
import * as deriving from "./methods/_data-deriving.mjs";
import * as overrides from "./methods/_derived-overrides.mjs";
import * as identifying from "./methods/_identifying.mjs";
import * as messages from "./methods/_messages.mjs";
import * as migrate from "./methods/_migrate-data.mjs";
import * as parsing from "./methods/_parsing.mjs";
import * as rolling from "./methods/_rolling.mjs";
import * as schema from "./methods/_schema.mjs";

/**
 * Equipment-specific item data model.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 *
 * @extends {TeriockBaseItemData}
 */
export default class TeriockEquipmentData extends WikiDataMixin(
  ConsumableDataMixin(TeriockBaseItemData),
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "equipment",
    });
  }

  /**
   * Gets the wiki page URL for the equipment.
   *
   * @returns {string} The wiki page URL for the equipment type.
   * @override
   */
  get wikiPage() {
    return `Equipment:${this.equipmentType}`;
  }

  /**
   * Gets the message rules-parts for the equipment.
   *
   * @returns {Teriock.MessageParts} Object containing message rules-parts for the equipment.
   * @override
   */
  get messageParts() {
    return {
      ...super.messageParts,
      ...messages._messageParts(this),
    };
  }

  /**
   * Gets the secret message rules-parts for the equipment.
   *
   * @returns {Teriock.MessageParts} Object containing secret message rules-parts for the equipment.
   * @override
   */
  get secretMessageParts() {
    return {
      ...super.secretMessageParts,
      ...messages._secretMessageParts(this),
    };
  }

  /**
   * Gets the current attunement data for the equipment.
   *
   * @returns {TeriockAttunement|null} The attunement data or null if not attuned.
   */
  get attunement() {
    return attunement._getAttunement(this);
  }

  /**
   * Checks if the equipment is currently attuned.
   *
   * @returns {boolean} True if the equipment is attuned, false otherwise.
   */
  get isAttuned() {
    return attunement._attuned(this);
  }

  /**
   * Checks if the equipment is currently equipped.
   *
   * @returns {boolean} - True if the equipment is equipped, false otherwise.
   */
  get isEquipped() {
    if (this.consumable) {
      return this.quantity >= 1 && this.equipped;
    } else {
      return this.equipped;
    }
  }

  /**
   * Checks if equipping is a valid operation.
   *
   * @returns {boolean}
   */
  get canEquip() {
    return (
      ((this.consumable && this.quantity >= 1) || !this.consumable) &&
      !this.isEquipped
    );
  }

  /**
   * Checks if unequipping is a valid operation.
   *
   * @returns {boolean}
   */
  get canUnequip() {
    return (
      ((this.consumable && this.quantity >= 1) || !this.consumable) &&
      this.isEquipped
    );
  }

  /**
   * Derived AV0 value.
   *
   * @returns {boolean}
   */
  get derivedAv0() {
    return overrides._derivedAv0(this);
  }

  /**
   * Derived UB value.
   *
   * @returns {boolean}
   */
  get derivedUb() {
    return overrides._derivedUb(this);
  }

  /**
   * Derived armor value.
   *
   * @returns {number}
   */
  get derivedAv() {
    return overrides._derivedAv(this);
  }

  /**
   * Derived block value.
   *
   * @returns {number}
   */
  get derivedBv() {
    return overrides._derivedBv(this);
  }

  /**
   * Derived damage dice.
   *
   * @returns {string}
   */
  get derivedDamage() {
    return overrides._derivedDamage(this);
  }

  /**
   * Derived two-handed damage dice.
   */
  get derivedTwoHandedDamage() {
    return overrides._derivedTwoHandedDamage(this);
  }

  /**
   * Defines the schema for the equipment data model.
   *
   * @returns {object} The schema definition for the equipment data.
   * @override
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      ...schema._defineSchema(),
    });
  }

  /**
   * Migrates data from older versions to the current format.
   *
   * @param {object} data - The data to migrate.
   * @returns {object} The migrated data.
   * @override
   */
  static migrateData(data) {
    data = migrate._migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Prepares derived data for the equipment.
   *
   * @returns {void}
   * @override
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    deriving._prepareDerivedData(this);
  }

  /**
   * Parses raw HTML content for the equipment.
   *
   * @param {string} rawHTML - The raw HTML content to parse.
   * @returns {Promise<object>} Promise that resolves to the parsed HTML content.
   * @override
   */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }

  /**
   * Rolls the equipment with the specified options.
   *
   * @param {object} options - Options for the equipment roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll(options) {
    await rolling._roll(this, options);
  }

  /**
   * Removes identification from the equipment.
   *
   * @returns {Promise<void>} Promise that resolves when the equipment is unidentified.
   */
  async unidentify() {
    await identifying._unidentify(this);
  }

  /**
   * Reads magic on the equipment to reveal its properties.
   *
   * @returns {Promise<void>} Promise that resolves when magic reading is complete.
   */
  async readMagic() {
    await identifying._readMagic(this);
  }

  /**
   * Identifies the equipment, revealing all its properties.
   *
   * @returns {Promise<void>} Promise that resolves when the equipment is identified.
   */
  async identify() {
    await identifying._identify(this);
  }

  /**
   * Attunes the equipment to the current character.
   *
   * @returns {Promise<TeriockEffect | null>} Promise that resolves to the attunement effect or null.
   */
  async attune() {
    return await attunement._attune(this);
  }

  /**
   * Removes attunement from the equipment.
   *
   * @returns {Promise<void>} Promise that resolves when the equipment is deattuned.
   */
  async deattune() {
    await attunement._deattune(this);
  }

  /**
   * Adds the specified property to this.
   *
   * @param {string} propertyKey - The property to add.
   * @returns {Promise<void>} Promise that resolves when the property is added.
   */
  async addProperty(propertyKey = "") {
    await createProperty(this.parent, propertyKey);
  }
}
