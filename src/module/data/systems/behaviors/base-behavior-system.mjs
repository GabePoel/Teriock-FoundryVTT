import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
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

  /**
   * @inheritDoc
   * @type {Teriock.Metadata.BehaviorSystemMetadata}
   */
  static metadata = mergeMetadata(super.metadata, {
    documentName: "RegionBehavior",
    type: "base",
    unqualifiedEvents: [CONST.REGION_EVENTS.TOKEN_EXIT],
  });

  /**
   * Check the surroundings of a token that entered or exited this region.
   * @param {RegionEvent} event
   */
  static async _onTokenChange(event) {
    event.data.token.actor?.system.checkSurroundings?.();
  }
}
