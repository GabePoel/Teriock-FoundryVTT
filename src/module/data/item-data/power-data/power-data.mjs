import TeriockBaseItemData from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";

const { fields } = foundry.data;

/**
 * Power-specific item data model.
 */
export default class TeriockPowerData extends TeriockBaseItemData {
  /** @inheritDoc */
  static metadata = Object.freeze({
    consumable: false,
    namespace: "",
    pageNameKey: "name",
    type: "power",
    usable: false,
    wiki: false,
  });

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /** @inheritDoc */
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
