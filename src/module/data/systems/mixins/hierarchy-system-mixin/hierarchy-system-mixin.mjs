import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { nullIdField } from "../../../fields/tools/builders.mjs";

/**
 * Data mixin to support hierarchies of the same document type.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, HierarchySystem & Teriock.Models.HierarchySystemData>}
 */
export default function HierarchySystemMixin(Base) {
  /**
   * @implements {Teriock.Models.HierarchySystemData}
   * @mixin
   */
  class HierarchySystem extends Base {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, { tags: { hierarchy: true } });

    /** @inheritDoc */
    static PRESERVED_PROPERTIES = ["system._sup", ...super.PRESERVED_PROPERTIES];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { _sup: nullIdField() });
    }
  }

  return HierarchySystem;
}
