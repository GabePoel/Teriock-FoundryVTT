import tradecraftConfig from "../../../../constants/config/tradecraft-config.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import BasePageSystem from "../base-page-system/base-page-system.mjs";

/**
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.TradecraftSystemData}
 */
export default class TradecraftSystem extends BasePageSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Fluency"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      field: new IdentifierField({
        choices: objectMap(tradecraftConfig.fields, f => f.label, { localize: true }),
        initial: "artisan",
        nullable: false,
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  get displayInputs() {
    return [...super.displayInputs, "system.field"];
  }

  /** @inheritDoc */
  get displayTags() {
    return [...super.displayTags, TERIOCK.config.tradecraft.fields[this.field]?.label];
  }

  /** @inheritDoc */
  get messageBars() {
    return [{
      icon: TERIOCK.config.tradecraft.fields[this.field]?.icon,
      label: _loc("TERIOCK.SYSTEMS.Fluency.FIELDS.field.label"),
      wrappers: [TERIOCK.config.tradecraft.fields[this.field]?.label],
    }];
  }
}
