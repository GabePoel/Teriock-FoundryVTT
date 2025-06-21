/** @import { MessageParts } from "../../../types/messages" */
import { ConsumableDataMixin } from "../../mixins/consumable-mixin.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";
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
 * @extends {TeriockBaseItemData}
 */
export default class TeriockEquipmentData extends WikiDataMixin(ConsumableDataMixin(TeriockBaseItemData)) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "equipment",
    });
  }

  /** @override */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      ...schema._defineSchema(),
    };
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    deriving._prepareDerivedData(this);
  }

  /** @override */
  static migrateData(data) {
    data = migrate._migrateData(data);
    return super.migrateData(data);
  }

  /** @override */
  get wikiPage() {
    return `Equipment:${this.equipmentType}`;
  }

  /** @override */
  async useOne() {
    await super.useOne();
    if (this.consumable && this.quantity <= 0) {
      await this.unequip();
    }
  }

  /** @override */
  async parse(rawHTML) {
    return await parsing._parse(this, rawHTML);
  }

  /** @override */
  async roll(options) {
    await rolling._roll(this, options);
  }

  /**
   * @returns {MessageParts}
   * @override
   */
  get messageParts() {
    return {
      ...super.messageParts,
      ...messages._messageParts(this),
    };
  }

  /**
   * @returns {MessageParts}
   * @override
   */
  get secretMessageParts() {
    return {
      ...super.secretMessageParts,
      ...messages._secretMessageParts(this),
    };
  }

  /**
   * @returns {Promise<void>}
   */
  async shatter() {
    await handling._shatter(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async repair() {
    await handling._repair(this);
  }

  /**
   * @param {boolean} bool
   * @returns {Promise<void>}
   */
  async setShattered(bool) {
    await handling._setShattered(this, bool);
  }

  /**
   * @returns {Promise<void>}
   */
  async toggleShattered() {
    await handling._toggleShattered(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async dampen() {
    await handling._dampen(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async undampen() {
    await handling._undampen(this);
  }

  /**
   * @param {boolean} bool
   * @returns {Promise<void>}
   */
  async setDampened(bool) {
    await handling._setDampened(this, bool);
  }

  /**
   * @returns {Promise<void>}
   */
  async toggleDampened() {
    await handling._toggleDampened(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async unequip() {
    await handling._unequip(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async equip() {
    await handling._equip(this);
  }

  /**
   * @param {boolean} bool
   * @returns {Promise<void>}
   */
  async setEquipped(bool) {
    await handling._setEquipped(this, bool);
  }

  /**
   * @returns {Promise<void>}
   */
  async toggleEquipped() {
    await handling._toggleEquipped(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async unidentify() {
    await identifying._unidentify(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async readMagic() {
    await identifying._readMagic(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async identify() {
    await identifying._identify(this);
  }
}
