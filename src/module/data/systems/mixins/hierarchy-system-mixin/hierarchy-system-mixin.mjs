import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { nullIdField } from "../../../fields/tools/builders.mjs";

/**
 * Data mixin to support hierarchies of the same document type.
 * @template {MixinBase} T
 * @param {T} Base
 * @category Hierarchy
 */
export default function HierarchySystemMixin(Base) {
  /**
   * @mixin
   */
  class HierarchySystem extends /** @type {InitializedDataModel<T, Teriock.Models.HierarchySystemData>} */ (Base) {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, {
      preserveOnRefresh: ["system._sup", ...super.metadata.preserveOnRefresh],
      tags: { hierarchy: true },
    });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { _sup: nullIdField() });
    }
  }

  return HierarchySystem;
}
