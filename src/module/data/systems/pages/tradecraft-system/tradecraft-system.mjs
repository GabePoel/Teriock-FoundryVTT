import { tradecraftConfig } from "../../../../constants/config/tradecraft-config.mjs";
import { getIdentifierIcon, objectMap } from "../../../../helpers/utils.mjs";
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
        choices: objectMap(tradecraftConfig, f => f.name, { localize: true }),
        initial: "artisan",
        nullable: false,
        required: true,
        type: "field",
      }),
    });
  }

  /** @inheritDoc */
  get displayInputs() {
    return [...super.displayInputs, "system.field"];
  }

  /** @inheritDoc */
  get displayTags() {
    return [...super.displayTags, TERIOCK.config.tradecraft[this._source.field]?.name];
  }

  /** @inheritDoc */
  get messageBars() {
    return [{
      icon: getIdentifierIcon(this.field),
      label: _loc("TERIOCK.SYSTEMS.Fluency.FIELDS.field.label"),
      wrappers: [TERIOCK.config.tradecraft[this._source.field]?.name],
    }];
  }
}
