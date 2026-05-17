import { powerConfig } from "../../../../constants/config/power-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { CompetenceModel } from "../../../models/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import BaseItemSystem from "../base-item-system/base-item-system.mjs";

const { fields } = foundry.data;

/**
 * Power-specific item data model.
 * @extends {BaseItemSystem}
 * @extends {Teriock.Models.PowerSystemData}
 * @mixes CompetenceDisplaySystem
 */
export default class PowerSystem extends mixClasses(BaseItemSystem, mixins.CompetenceDisplaySystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Power"];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "power",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      competence: new fields.EmbeddedDataField(CompetenceModel, {
        initial: { raw: 1 },
      }),
      maxAv: new fields.NumberField({
        initial: 4,
        integer: true,
        min: 0,
      }),
      type: new fields.StringField({
        choices: localizeChoices(objectMap(powerConfig.type, v => v.label)),
        initial: "other",
      }),
    });
  }

  /** @inheritDoc */
  get color() {
    return powerConfig.type[this.type].color;
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = dotJoin([powerConfig.type[this.type].label, parts.text]);
    parts.subtitle = _loc("TYPES.Item.power");
    return parts;
  }

  /** @inheritDoc */
  get makeSuppressed() {
    let suppressed = super.makeSuppressed;
    if (
      game.teriock.getSetting("armorSuppressesRanks") &&
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
        icon: powerConfig.type[this.type].icon,
        label: _loc("TERIOCK.SYSTEMS.Power.FIELDS.type.label"),
        wrappers: [
          powerConfig.type[this.type].label,
          this.maxAv === 0
            ? _loc("TERIOCK.SYSTEMS.Power.PANELS.noArmor")
            : _loc("TERIOCK.SYSTEMS.Power.PANELS.maxAv", {
                value: this.maxAv,
              }),
        ],
      },
    ];
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) {
      return false;
    }

    if (
      this.actor?.powers.map(p => p.system.identifier).includes(this.identifier) &&
      ["mage", "semi", "warrior"].includes(this.identifier)
    ) {
      return false;
    }
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      [`type.${toCamelCase(this.type)}`]: 1,
      av: this.maxAv,
      maxAv: this.maxAv,
    };
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if (game.teriock.getSetting("armorWeakensRanks") && this.actor && this.actor.system.defense.av.base > this.maxAv) {
      this.proficient = false;
    }
  }
}
