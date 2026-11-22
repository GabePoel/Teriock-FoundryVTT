import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "./_module.mjs";

/**
 * @import { RegionBehaviorType } from "@client/data/region-behaviors/_module.mjs";
 */

// TODO: Move to some abstract behavior folder to match other data models

/**
 * Mixin for systems that wrap a core region behavior type.
 * @template {MixinBase<typeof RegionBehaviorType>} T
 * @param {T} Base
 */
export default function WrappedBehaviorSystemMixin(Base) {
  /**
   * @extends {RegionBehaviorType}
   * @mixes BaseSystem
   * @mixes UncommonSystem
   * @mixin
   */
  class WrappedBehaviorSystem extends mixClasses(Base, BaseSystemMixin, UncommonSystemMixin) {
    /**
     * @inheritDoc
     * @type {Teriock.Metadata.BehaviorSystemMetadata}
     */
    static metadata = mergeMetadata(super.metadata, { documentName: "RegionBehavior", unqualifiedEvents: [] });

    /** @inheritDoc */
    static registerModel() {
      CONFIG.RegionBehavior.dataModels[this.metadata.type] = this;
    }

    /** @inheritDoc */
    _getTerrainEffects(token, segment, options) {
      if (!this.behavior.checkQualifier(token)) { return []; }
      return super._getTerrainEffects(token, segment, options);
    }
  }

  return WrappedBehaviorSystem;
}
