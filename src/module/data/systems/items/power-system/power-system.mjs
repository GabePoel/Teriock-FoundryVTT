import { dotJoin, mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { ArmorSuppressionSystemMixin } from "../../mixins/_module.mjs";
import { SimpleItemSystem } from "../abstract/_module.mjs";

/**
 * Power-specific item data model.
 * @extends {SimpleItemSystem}
 * @mixes ArmorSuppressionSystem
 */
export default class PowerSystem extends mixClasses(SimpleItemSystem, ArmorSuppressionSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Power"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.power,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.power,
    initialCompetence: 1,
    initialKind: "other",
    kinds: _replace(TERIOCK.CONFIG.power.kind),
    type: "power",
  });

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.text = dotJoin([_loc(this._kindEntry.label), parts.text]);
    return parts;
  }
}
