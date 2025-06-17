const { fields } = foundry.data;
import { _messageParts } from "./_message-parts.mjs";
import { TeriockBaseItemData } from "../base-data/base-data.mjs";

export class TeriockPowerData extends TeriockBaseItemData {
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
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
    }
  }

  /** @override */
  get messageParts() {
    return { ...super.messageParts, ..._messageParts(this.parent) };
  }
}