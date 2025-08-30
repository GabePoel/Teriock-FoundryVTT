import { getRollIcon, mergeFreeze } from "../../../helpers/utils.mjs";
import { ConsumableDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import * as attunement from "./methods/_attunement.mjs";
import * as contextMenus from "./methods/_context-menus.mjs";
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
 * @mixes ConsumableDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockEquipmentData extends ConsumableDataMixin(
  WikiDataMixin(TeriockBaseItemData),
) {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ItemModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    namespace: "Equipment",
    pageNameKey: "system.equipmentType",
    type: "equipment",
    usable: true,
    childEffectTypes: ["ability", "fluency", "property", "resource"],
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      ...schema._defineSchema(),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = migrate._migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Gets the current attunement data for the equipment.
   * @returns {TeriockAttunement|null} The attunement data or null if not attuned.
   */
  get attunement() {
    return attunement._getAttunement(this);
  }

  /**
   * Checks if equipping is a valid operation.
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
   * @returns {boolean}
   */
  get canUnequip() {
    return (
      ((this.consumable && this.quantity >= 1) || !this.consumable) &&
      this.isEquipped
    );
  }

  /** @inheritDoc */
  get cardContextMenuEntries() {
    return [...super.cardContextMenuEntries, ...contextMenus._entries(this)];
  }

  /**
   * Derived armor value.
   * @returns {number}
   */
  get derivedAv() {
    return overrides._derivedAv(this);
  }

  /**
   * Derived AV0 value.
   * @returns {boolean}
   */
  get derivedAv0() {
    return overrides._derivedAv0(this);
  }

  /**
   * Derived block value.
   * @returns {number}
   */
  get derivedBv() {
    return overrides._derivedBv(this);
  }

  /**
   * Derived damage dice.
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
   * Derived UB value.
   * @returns {boolean}
   */
  get derivedUb() {
    return overrides._derivedUb(this);
  }

  /**
   * Derived warded value.
   * @returns {boolean}
   */
  get derivedWarded() {
    return overrides._derivedWarded(this);
  }

  /**
   * Checks if the equipment is currently attuned.
   * @returns {boolean} True if the equipment is attuned, false otherwise.
   */
  get isAttuned() {
    return attunement._attuned(this);
  }

  /**
   * Checks if the equipment is currently equipped.
   * @returns {boolean} - True if the equipment is equipped, false otherwise.
   */
  get isEquipped() {
    if (this.consumable) {
      return this.quantity >= 1 && this.equipped;
    } else {
      return this.equipped;
    }
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ...messages._messageParts(this),
    };
  }

  /** @inheritDoc */
  get secretMessageParts() {
    return {
      ...super.secretMessageParts,
      ...messages._secretMessageParts(this),
    };
  }

  /** @inheritDoc */
  get useIcon() {
    return getRollIcon(this.derivedDamage);
  }

  /**
   * Attunes the equipment to the current character.
   * @returns {Promise<TeriockEffect | null>} Promise that resolves to the attunement effect or null.
   */
  async attune() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentAttune", data);
    if (!data.cancel) return await attunement._attune(this);
  }

  /**
   * Dampen this equipment.
   * @returns {Promise<void>}
   */
  async dampen() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentDampen", data);
    if (!data.cancel) await this.parent.update({ "system.dampened": true });
  }

  /**
   * Removes attunement from the equipment.
   * @returns {Promise<void>} Promise that resolves when the equipment is deattuned.
   */
  async deattune() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentDeattune", data);
    if (!data.cancel) await attunement._deattune(this);
  }

  /**
   * Equip this equipment.
   * @returns {Promise<void>}
   */
  async equip() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentEquip", data);
    if (!data.cancel) await this.parent.update({ "system.equipped": true });
  }

  /**
   * Glue this equipment.
   * @returns {Promise<void>}
   */
  async glue() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentGlue", data);
    if (!data.cancel) await this.parent.update({ "system.glued": true });
  }

  /**
   * Identifies the equipment, revealing all its properties.
   * @returns {Promise<void>} Promise that resolves when the equipment is identified.
   */
  async identify() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentIdentify", data);
    if (!data.cancel) await identifying._identify(this);
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    deriving._prepareDerivedData(this);
  }

  /**
   * Reads magic on the equipment to reveal its properties.
   * @returns {Promise<void>} Promise that resolves when magic reading is complete.
   */
  async readMagic() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentReadMagic", data);
    if (!data.cancel) await identifying._readMagic(this);
  }

  /**
   * Repair this equipment.
   * @returns {Promise<void>}
   */
  async repair() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentRepair", data);
    if (!data.cancel) await this.parent.update({ "system.shattered": false });
  }

  /** @inheritDoc */
  async roll(options) {
    await rolling._roll(this, options);
  }

  /**
   * Shatter this equipment.
   * @returns {Promise<void>}
   */
  async shatter() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentShatter", data);
    if (!data.cancel) await this.parent.update({ "system.shattered": true });
  }

  /**
   * Undampen this equipment.
   * @returns {Promise<void>}
   */
  async undampen() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentUndampen", data);
    if (!data.cancel) await this.parent.update({ "system.dampened": false });
  }

  /**
   * Unequip this equipment.
   * @returns {Promise<void>}
   */
  async unequip() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentUnequip", data);
    if (!data.cancel) await this.parent.update({ "system.equipped": false });
  }

  /**
   * Unglue this equipment.
   * @returns {Promise<void>}
   */
  async unglue() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentUnglue", data);
    if (!data.cancel) await this.parent.update({ "system.glued": false });
  }

  /**
   * Removes identification from the equipment.
   * @returns {Promise<void>} Promise that resolves when the equipment is unidentified.
   */
  async unidentify() {
    const data = { doc: this.parent };
    await this.parent.hookCall("equipmentUnidentify", data);
    if (!data.cancel) await identifying._unidentify(this);
  }
}
