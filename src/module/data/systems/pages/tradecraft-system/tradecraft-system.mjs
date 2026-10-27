import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import { FluencySystem } from "../../effects/_module.mjs";
import { WikiSystemMixin } from "../../mixins/_module.mjs";
import BasePageSystem from "../base-page-system/base-page-system.mjs";

/**
 * @extends {BasePageSystem}
 * @mixes WikiSystem
 */
export default class TradecraftSystem extends mixClasses(BasePageSystem, WikiSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Fluency"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: FluencySystem.metadata.icon,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.tradecraft,
    type: "tradecraft",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      field: new IdentifierField({
        choices: TERIOCK.CONFIG.tradecraft.fields,
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
    return [...super._displayTags, TERIOCK.CONFIG.tradecraft.fields[this._source.field]?.label];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [{
      icon: TERIOCK.CONFIG.tradecraft.fields[this._source.field]?.icon,
      label: _loc("TERIOCK.COMMON.Field"),
      wrappers: [TERIOCK.CONFIG.tradecraft.fields[this._source.field]?.label],
    }];
  }
}
