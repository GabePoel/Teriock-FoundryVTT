const { fields } = foundry.data;
import {
  _dampen,
  _equip,
  _repair,
  _setDampened,
  _setEquipped,
  _setShattered,
  _shatter,
  _toggleDampened,
  _toggleEquipped,
  _toggleShattered,
  _undampen,
  _unequip,
} from "./_handling.mjs";
import {
  _identify,
  _readMagic,
  _unidentify,
} from "./_identifying.mjs";
import { _messageParts, _secretMessageParts } from "./_message-parts.mjs";
import { _parse } from "./_parsing.mjs";
import { _roll } from "./_rolling.mjs";
import { ConsumableDataMixin } from "../../mixins/consumable-mixin.mjs";
import { equipmentOptions } from "../../../helpers/constants/equipment-options.mjs";
import { TeriockBaseItemData } from "../base-data/base-data.mjs";
import { WikiDataMixin } from "../../mixins/wiki-mixin.mjs";

export class TeriockEquipmentData extends WikiDataMixin(ConsumableDataMixin(TeriockBaseItemData)) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      wikiNamespace: new fields.StringField({ initial: "Equipment", gmOnly: true }),
      equipped: new fields.BooleanField({
        initial: true,
        label: "Equipped",
      }),
      glued: new fields.BooleanField({
        initial: false,
        label: "Glued",
      }),
      shattered: new fields.BooleanField({
        initial: false,
        label: "Shattered"
      }),
      dampened: new fields.BooleanField({
        initial: false,
        label: "Dampened"
      }),
      consumable: new fields.BooleanField({
        initial: false,
        label: "Consumable",
      }),
      quantity: new fields.NumberField({ initial: 1 }),
      maxQuantity: new fields.NumberField({ initial: null, nullable: true }),
      maxQuantityRaw: new fields.StringField({ initial: null, nullable: true }),
      ranged: new fields.BooleanField({
        initial: false,
        label: "Ranged",
      }),
      damage: new fields.StringField({ initial: "0" }),
      twoHandedDamage: new fields.StringField({ initial: "0" }),
      damageTypes: new fields.ArrayField(new fields.StringField()),
      weight: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      range: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      shortRange: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      equipmentClasses: new fields.ArrayField(new fields.StringField({
        choices: equipmentOptions.equipmentClasses,

      })),
      minStr: new fields.NumberField({
        initial: -3,
        integer: true,
        min: -3,
      }),
      sb: new fields.StringField({ initial: null, nullable: true }),
      av: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      bv: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      specialRules: new fields.HTMLField({ initial: "" }),
      equipmentType: new fields.StringField({ initial: "Equipment Type" }),
      powerLevel: new fields.StringField({
        initial: "mundane",
        choices: equipmentOptions.powerLevelShort
      }),
      flaws: new fields.HTMLField({ initial: "" }),
      notes: new fields.HTMLField({ initial: "" }),
      tier: new fields.NumberField({
        initial: 0,
        integer: true,
        min: 0,
      }),
      fullTier: new fields.StringField({ initial: "" }),
      manaStoring: new fields.StringField({ initial: "" }),
      identified: new fields.BooleanField({ initial: true }),
      reference: new fields.DocumentUUIDField({
        initial: null,
        nullable: true,
        gmOnly: true
      }),
    }
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
    return await _parse(this.parent, rawHTML);
  }

  /** @override */
  async roll(options) {
    await _roll(this.parent, options);
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this.parent) };
  }

  /** @override */
  get secretMessageParts() {
    return { ...super.secretMessageParts, ..._secretMessageParts(this.parent) };
  }

  async shatter() {
    await _shatter(this.parent);
  }

  async repair() {
    await _repair(this.parent);
  }

  async setShattered(bool) {
    await _setShattered(this.parent, bool);
  }

  async toggleShattered() {
    await _toggleShattered(this.parent);
  }

  async dampen() {
    await _dampen(this.parent);
  }

  async undampen() {
    await _undampen(this.parent);
  }

  async setDampened(bool) {
    await _setDampened(this.parent, bool);
  }

  async toggleDampened() {
    await _toggleDampened(this.parent);
  }

  async unequip() {
    await _unequip(this.parent);
  }

  async equip() {
    await _equip(this.parent);
  }

  async setEquipped(bool) {
    await _setEquipped(this.parent, bool);
  }

  async toggleEquipped() {
    await _toggleEquipped(this.parent);
  }

  async unidentify() {
    await _unidentify(this.parent);
  }

  async readMagic() {
    await _readMagic(this.parent);
  }

  async identify() {
    await _identify(this.parent);
  }
}
