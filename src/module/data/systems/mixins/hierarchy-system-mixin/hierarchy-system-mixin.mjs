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
    static PRESERVED_PROPERTIES = ["system._sup", ...super.PRESERVED_PROPERTIES];

    /** @inheritDoc */
    static get metadata() {
      return Object.assign(super.metadata, { hierarchy: true });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { _sup: nullIdField() });
    }
  }

  return HierarchySystem;
}
