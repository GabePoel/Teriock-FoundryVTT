const { fields } = foundry.data;
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _roll } from "./methods/_rolling.mjs";
import { ConsumableDataMixin } from "../../mixins/consumable-mixin.mjs";
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockResourceData extends ConsumableDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "resource",
    });
  }

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
      maxQuantity: new fields.SchemaField({
        raw: new fields.StringField({
          label: "Max Quantity (Raw)",
          initial: "",
        }),
        derived: new fields.NumberField({
          initial: 0,
          integer: true,
          label: "Max Quantity (Derived)",
          min: 0,
        }),
      }),
      rollFormula: new fields.StringField({
        initial: "",
        label: "Roll Formula",
      }),
      functionHook: new fields.StringField({
        initial: "none",
        label: "Function Hook",
      }),
    };
  }

  /** @override */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /** @override */
  async roll(options) {
    await _roll(this, options);
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /** @override */
  async useOne() {
    const toDisable = this.quantity <= 1;
    await super.useOne();
    if (toDisable) {
      await this.parent.setForceDisabled(true);
    }
  }

  /** @override */
  async gainOne() {
    await super.gainOne();
    await this.parent.setForceDisabled(false);
  }
}
