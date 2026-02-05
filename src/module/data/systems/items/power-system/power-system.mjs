import { toCamelCase } from "../../../../helpers/string.mjs";
import { mix } from "../../../../helpers/utils.mjs";
import { TextField } from "../../../fields/_module.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Power-specific item data model.
 * @extends {BaseItemSystem}
 * @implements {Teriock.Models.PowerSystemInterface}
 * @mixes CompetenceDisplaySystem
 */
export default class PowerSystem extends mix(
  BaseItemSystem,
  mixins.CompetenceDisplaySystemMixin,
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "power",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      flaws: new TextField({
        initial: "",
        label: "Flaws",
      }),
      maxAv: new fields.NumberField({
        initial: 4,
        integer: true,
        label: "Maximum AV",
        min: 0,
      }),
      competence: new fields.EmbeddedDataField(CompetenceModel, {
        initial: { raw: 1 },
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
        icon: TERIOCK.options.power[this.type].icon,
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
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      [`type.${toCamelCase(this.type)}`]: 1,
      maxAv: this.maxAv,
      av: this.maxAv,
    };
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
