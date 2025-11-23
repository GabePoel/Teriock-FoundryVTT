import { ProficiencyDataMixin } from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";

const { fields } = foundry.data;

/**
 * Power-specific item data model.
 * @mixes ProficiencyData
 */
export default class TeriockPowerModel extends ProficiencyDataMixin(
  TeriockBaseItemModel,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "power",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      type: new fields.StringField({
        initial: "other",
        label: "Power Type",
      }),
      flaws: new TextField({
        initial: "",
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
    return TERIOCK.options.power[this.type].color;
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", "system.flaws"];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = TERIOCK.options.power[this.type].name;
    parts.subtitle = "Power";
    return parts;
  }

  /** @inheritDoc */
  get messageBars() {
    return [
      {
        icon: "fa-" + TERIOCK.options.power[this.type].icon,
        label: "Power Type",
        wrappers: [TERIOCK.options.power[this.type].name],
      },
    ];
  }
}
