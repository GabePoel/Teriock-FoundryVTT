import { createProperty } from "../../../helpers/create-effects.mjs";
import { getRollIcon, makeIcon } from "../../../helpers/utils.mjs";
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
   * Context menu entries to display for cards that represent the parent document.
   *
   * @returns {Teriock.ContextMenuEntry[]}
   */
  get cardContextMenuEntries() {
    return [
      ...super.cardContextMenuEntries,
      {
        name: "Use in Two Hands",
        icon: makeIcon(getRollIcon(this.derivedTwoHandedDamage), "contextMenu"),
        callback: this.roll.bind(this, { twoHanded: true }),
        condition: this.derivedTwoHandedDamage !== this.derivedDamage,
        group: "usage",
      },
      {
        name: "Identify",
        icon: makeIcon("eye", "contextMenu"),
        callback: this.identify.bind(this),
        condition: !this.identified && this.reference,
        group: "usage",
      },
      {
        name: "Read Magic",
        icon: makeIcon("hand", "contextMenu"),
        callback: this.readMagic.bind(this),
        condition:
          !this.identified && this.reference && this.powerLevel === "unknown",
        group: "usage",
      },
      {
        name: "Equip",
        icon: makeIcon("check", "contextMenu"),
        callback: this.equip.bind(this),
        condition: this.canEquip,
        group: "control",
      },
      {
        name: "Unequip",
        icon: makeIcon("xmark", "contextMenu"),
        callback: this.unequip.bind(this),
        condition: this.canUnequip,
        group: "control",
      },
      {
        name: "Attune",
        icon: makeIcon("handshake-simple", "contextMenu"),
        callback: this.attune.bind(this),
        condition: !this.isAttuned,
        group: "control",
      },
      {
        name: "Deattune",
        icon: makeIcon("handshake-simple-slash", "contextMenu"),
        callback: this.deattune.bind(this),
        condition: this.isAttuned,
        group: "control",
      },
      {
        name: "Glue",
        icon: makeIcon("link", "contextMenu"),
        callback: this.glue.bind(this),
        condition: !this.glued,
        group: "control",
      },
      {
        name: "Unglue",
        icon: makeIcon("link-slash", "contextMenu"),
        callback: this.unglue.bind(this),
        condition: this.glued,
        group: "control",
      },
      {
        name: "Shatter",
        icon: makeIcon("wine-glass-crack", "contextMenu"),
        callback: this.shatter.bind(this),
        condition: !this.shattered,
        group: "control",
      },
      {
        name: "Repair",
        icon: makeIcon("wine-glass", "contextMenu"),
        callback: this.repair.bind(this),
        condition: this.shattered,
        group: "control",
      },
      {
        name: "Dampen",
        icon: makeIcon("bell-slash", "contextMenu"),
        callback: this.dampen.bind(this),
        condition: !this.dampened,
        group: "control",
      },
      {
        name: "Undampen",
        icon: makeIcon("bell", "contextMenu"),
        callback: this.undampen.bind(this),
        condition: this.dampened,
        group: "control",
      },
      {
        name: "Make Unidentified Copy",
        icon: makeIcon("eye-slash", "contextMenu"),
        callback: this.unidentify.bind(this),
        condition: this.identified && game.user.isGM,
        group: "usage",
      },
    ];
  }

  /** @inheritDoc */
  get useIcon() {
    return getRollIcon(this.derivedDamage);
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
   * Equip this equipment.
   *
   * @returns {Promise<void>}
   */
  async equip() {
    await this.actor?.hookCall("equipmentEquip", this.parent);
    await this.parent.update({ "system.equipped": true });
  }

  /**
   * Unequip this equipment.
   *
   * @returns {Promise<void>}
   */
  async unequip() {
    await this.actor?.hookCall("equipmentUnequip", this.parent);
    await this.parent.update({ "system.equipped": false });
  }

  /**
   * Removes identification from the equipment.
   *
   * @returns {Promise<void>} Promise that resolves when the equipment is unidentified.
   */
  async unidentify() {
    await this.actor?.hookCall("equipmentUnidentify", this.parent);
    await identifying._unidentify(this);
  }

  /**
   * Reads magic on the equipment to reveal its properties.
   *
   * @returns {Promise<void>} Promise that resolves when magic reading is complete.
   */
  async readMagic() {
    await this.actor?.hookCall("equipmentReadMagic", this.parent);
    await identifying._readMagic(this);
  }

  /**
   * Identifies the equipment, revealing all its properties.
   *
   * @returns {Promise<void>} Promise that resolves when the equipment is identified.
   */
  async identify() {
    await this.actor?.hookCall("equipmentIdentify", this.parent);
    await identifying._identify(this);
  }

  /**
   * Attunes the equipment to the current character.
   *
   * @returns {Promise<TeriockEffect | null>} Promise that resolves to the attunement effect or null.
   */
  async attune() {
    await this.actor?.hookCall("equipmentAttune", this.parent);
    return await attunement._attune(this);
  }

  /**
   * Removes attunement from the equipment.
   *
   * @returns {Promise<void>} Promise that resolves when the equipment is deattuned.
   */
  async deattune() {
    await this.actor?.hookCall("equipmentDeattune", this.parent);
    await attunement._deattune(this);
  }

  /**
   * Shatter this equipment.
   *
   * @returns {Promise<void>}
   */
  async shatter() {
    await this.actor?.hookCall("equipmentShatter", this.parent);
    await this.parent.update({ "system.shattered": true });
  }

  /**
   * Repair this equipment.
   *
   * @returns {Promise<void>}
   */
  async repair() {
    await this.actor?.hookCall("equipmentRepair", this.parent);
    await this.parent.update({ "system.shattered": false });
  }

  /**
   * Dampen this equipment.
   *
   * @returns {Promise<void>}
   */
  async dampen() {
    await this.actor?.hookCall("equipmentDampen", this.parent);
    await this.parent.update({ "system.dampened": true });
  }

  /**
   * Undampen this equipment.
   *
   * @returns {Promise<void>}
   */
  async undampen() {
    await this.actor?.hookCall("equipmentUndampen", this.parent);
    await this.parent.update({ "system.dampened": false });
  }

  /**
   * Glue this equipment.
   *
   * @returns {Promise<void>}
   */
  async glue() {
    await this.actor?.hookCall("equipmentGlue", this.parent);
    await this.parent.update({ "system.glued": true });
  }

  /**
   * Unglue this equipment.
   *
   * @returns {Promise<void>}
   */
  async unglue() {
    await this.actor?.hookCall("equipmentUnglue", this.parent);
    await this.parent.update({ "system.glued": false });
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
