const { fields } = foundry.data;
import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";

/**
 * Power-specific item data model.
 */
export default class TeriockPowerData extends TeriockBaseItemData {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject({}, { type: "power" });
  }

  /**
   * Gets the message parts for the power.
   * Combines base message parts with power-specific message parts.
   *
   * @returns {Teriock.MessageParts} Object containing message parts for the power.
   * @override
   */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /**
   * Defines the schema for the power data model.
   *
   * @returns {object} The schema definition for the power data.
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      type: new fields.StringField({
        initial: "other",
        label: "Power Type",
      }),
      flaws: new fields.HTMLField({ initial: "<p>None.</p>" }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
      size: new fields.NumberField({
        initial: 3,
        min: 0,
        label: "Size",
      }),
      lifespan: new fields.NumberField({
        initial: 100,
        min: 0,
        label: "Maximum Lifespan",
      }),
      adult: new fields.NumberField({
        initial: 20,
        min: 0,
        label: "Age of Maturity",
      }),
    });
  }
}
