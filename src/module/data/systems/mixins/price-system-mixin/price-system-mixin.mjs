import { mergeMetadata } from "../../../../utils/_module.mjs";
import { UnitField } from "../../../fields/_module.mjs";
import { MoneyUnitModel } from "../../../models/_module.mjs";

/**
 * Relevant wiki pages:
 * - [Price](https://wiki.teriock.com/index.php?title=Core:Price)
 *
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PriceSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.PriceSystemData}
   */
  class PriceSystem extends /** @type {InitializedDataModel<T, Teriock.Models.PriceSystemData>} */ (Base) {
    /** @inheritDoc */
    static metadata = mergeMetadata(super.metadata, {
      preserveOnRefresh: ["system.price", ...super.metadata.preserveOnRefresh],
    });

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { price: new UnitField(MoneyUnitModel, { secret: true }) });
    }

    /**
     * Price wrappers.
     * @returns {string[]}
     */
    get _priceWrappers() {
      if (this.parent.isSecret || this.price.unitType !== "finite" || this.parent.parent?.type !== "inventory") {
        return [];
      }
      return [this.price.tag];
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), { price: this.price.rollValue });
    }
  }

  return PriceSystem;
}
