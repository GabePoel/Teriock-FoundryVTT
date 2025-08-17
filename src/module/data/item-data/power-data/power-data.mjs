import { TextField } from "../../shared/fields.mjs";
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
      flaws: new TextField({ initial: "<p>None.</p>", label: "Flaws" }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
    });
  }
}
