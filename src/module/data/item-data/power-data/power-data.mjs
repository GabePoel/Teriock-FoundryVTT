import { mergeFreeze } from "../../../helpers/utils.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import { _messageParts } from "./methods/_messages.mjs";

const { fields } = foundry.data;

/**
 * Power-specific item data model.
 */
export default class TeriockPowerModel extends TeriockBaseItemModel {
  /** @inheritDoc */
  static metadata = mergeFreeze(super.metadata, {
    type: "power",
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      type: new fields.StringField({
        initial: "other",
        label: "Power Type",
      }),
      flaws: new TextField({
        initial: "<p>None.</p>",
        label: "Flaws",
      }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (
      foundry.utils.hasProperty(data, "type") &&
      foundry.utils.getProperty(data, "type") === "species"
    ) {
      foundry.utils.setProperty(data, "type", "other");
    }
  }

  /** @inheritDoc */
  get color() {
    return TERIOCK.display.colors[TERIOCK.options.power[this.type].color];
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }
}
