import { mergeMetadata, mixClasses, omit } from "../../../utils/_module.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../mixins/_module.mjs";

const { RegionBehaviorType } = foundry.data.regionBehaviors;

/**
 * @extends {RegionBehaviorType}
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class BaseBehaviorSystem extends mixClasses(RegionBehaviorType, BaseSystemMixin, UncommonSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "BEHAVIOR.TYPES.base"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { documentName: "RegionBehavior", type: "base" });

  /** @inheritDoc */
  static defineSchema() {
    return omit(super.defineSchema(), ["_src"]);
  }
}
