import { ProficiencyDataMixin } from "../../mixins/_module.mjs";
import { TextField } from "../../shared/fields/_module.mjs";
import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";

const { fields } = foundry.data;

/**
 * Power-specific item data model.
 * @extends {TeriockBaseItemModel}
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
      flaws: new TextField({
        initial: "",
        label: "Flaws",
      }),
      maxAv: new fields.NumberField({
        initial: 4,
        integer: true,
        label: "Max AV",
        min: 0,
      }),
      proficient: new fields.BooleanField({
        initial: true,
        label: "Proficient",
      }),
      type: new fields.StringField({
        initial: "other",
        label: "Power Type",
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
    return super.migrateData(data);
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
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (
      game.settings.get("teriock", "armorSuppressesRanks") &&
      this.actor &&
      !this.innate &&
      this.actor.system.defense.av.base > this.maxAv
    ) {
      suppressed = true;
    }
    return suppressed;
  }

  /** @inheritDoc */
  get messageBars() {
    return [
      {
        icon: "fa-" + TERIOCK.options.power[this.type].icon,
        label: "Power Type",
        wrappers: [
          TERIOCK.options.power[this.type].name,
          this.maxAv === 0 ? "No Armor" : this.maxAv + " Max AV",
        ],
      },
    ];
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    if (
      this.actor?.powers.map((p) => p.name).includes(this.parent.name) &&
      ["Warrior", "Semi", "Mage"].includes(this.parent.name)
    ) {
      return false;
    }
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if (
      game.settings.get("teriock", "armorWeakensRanks") &&
      this.actor &&
      this.actor.system.defense.av.base > this.maxAv
    ) {
      this.proficient = false;
    }
  }
}
