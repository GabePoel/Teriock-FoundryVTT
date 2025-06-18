const { fields } = foundry.data;
import { _messageParts } from "./methods/_message-parts.mjs";
import { _roll } from "./methods/_rolling.mjs";
import { ConsumableDataMixin } from "../../mixins/consumable-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

export default class TeriockResourceData extends ConsumableDataMixin(TeriockBaseEffectData) {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      consumable: new fields.BooleanField({
        initial: true,
        label: "Consumable",
      }),
      quantity: new fields.NumberField({
        initial: 1,
        integer: true,
        label: "Quantity",
        min: 0,
        nullable: true,
      }),
      maxQuantityRaw: new fields.StringField({
        initial: null,
        label: "Max Quantity (Raw)",
        nullable: true,
      }),
      maxQuantity: new fields.NumberField({
        initial: null,
        label: "Max Quantity",
        nullable: true,
      }),
      rollFormula: new fields.StringField({
        initial: "",
        label: "Roll Formula",
      }),
      functionHook: new fields.StringField({
        initial: "none",
        label: "Function Hook",
      }),
    }
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
  async useOne() {
    await super.useOne();
    if (this.quantity <= 0) {
      await this.parent.setForceDisabled(true);
    }
  }

  /** @override */
  async gainOne() {
    await super.gainOne();
    await this.parent.setForceDisabled(false);
  }
}