import tradecraftConfig from "../../../../constants/config/tradecraft-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { toCamelCase } from "../../../../helpers/string.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
import BasePageSystem from "../base-page-system/base-page-system.mjs";

/**
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.TradecraftSystemData}
 * @mixes WikiSystem
 */
export default class TradecraftSystem extends mixClasses(BasePageSystem, systemMixins.WikiSystemMixin) {
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
        type: "field",
      }),
    });
  }

  /** @inheritDoc */
  get _displayInputs() {
    return [...super._displayInputs, "system.field"];
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, TERIOCK.config.tradecraft.fields[this._source.field]?.label];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [{
      icon: TERIOCK.config.tradecraft.fields[this._source.field]?.icon,
      label: _loc("TERIOCK.SYSTEMS.Fluency.FIELDS.field.label"),
      wrappers: [TERIOCK.config.tradecraft.fields[this._source.field]?.label],
    }];
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Tradecraft:${TERIOCK.index.tradecrafts[toCamelCase(this.identifier ?? "")] ?? ""}`;
  }
}
