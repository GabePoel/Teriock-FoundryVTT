const { fields } = foundry.data;
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _roll } from "./methods/_rolling.mjs";
import ConsumableDataMixin from "../../mixins/consumable-mixin.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";

/**
 * Resource-specific effect data model.
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockResourceData extends ConsumableDataMixin(TeriockBaseEffectData) {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "resource",
    });
  }

  /**
   * Checks if the resource effect is suppressed.
   * Combines base suppression with attunement-based suppression for equipment.
   * @returns {boolean} True if the resource effect is suppressed, false otherwise.
   * @override
   */
  get suppressed() {
    let suppressed = super.suppressed;
    if (!suppressed && this.parent?.parent?.type === "equipment") {
      suppressed = !this.parent.parent.system.attuned;
    }
    return suppressed;
  }

  /**
   * Gets the message parts for the resource effect.
   * Combines base message parts with resource-specific message parts.
   * @returns {object} Object containing message parts for the resource effect.
   * @override
   */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this) };
  }

  /**
   * Defines the schema for the resource data model.
   * @returns {object} The schema definition for the resource data.
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
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
    });
  }

  /**
   * Migrates data from older versions to the current format.
   * @param {object} data - The data to migrate.
   * @returns {object} The migrated data.
   * @override
   */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Rolls the resource effect with the specified options.
   * @param {object} options - Options for the resource roll.
   * @returns {Promise<void>} Promise that resolves when the roll is complete.
   * @override
   */
  async roll(options) {
    await _roll(this, options);
  }

  /**
   * Uses one unit of the resource.
   * If quantity becomes 0 or less, disables the parent effect.
   * @returns {Promise<void>} Promise that resolves when the resource is used.
   * @override
   */
  async useOne() {
    const toDisable = this.quantity <= 1;
    await super.useOne();
    if (toDisable) {
      await this.parent.disable();
    }
  }

  /**
   * Gains one unit of the resource.
   * Re-enables the parent effect when gaining resources.
   * @returns {Promise<void>} Promise that resolves when the resource is gained.
   * @override
   */
  async gainOne() {
    await super.gainOne();
    await this.parent.enable();
  }
}
