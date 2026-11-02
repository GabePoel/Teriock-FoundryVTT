import { mergeMetadata } from "../../../../utils/_module.mjs";

const { fields } = foundry.data;

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
      return Object.assign(super.defineSchema(), {
        price: new fields.NumberField({
          blank: true,
          initial: null,
          integer: false,
          min: 0,
          nullable: true,
          placeholder: _loc("COMMON.None"),
          required: true,
          step: 0.01,
        }),
      });
    }

    /**
     * Price wrappers.
     * @returns {string[]}
     */
    get _priceWrappers() {
      if (!this._shouldShowPriceWrapper) { return []; }
      return [_loc("TERIOCK.SYSTEMS.Equipment.PANELS.price", { value: this.price.toNearest(0.01) })];
    }

    /**
     * Whether to show the price wrapper.
     * @return {boolean}
     */
    get _shouldShowPriceWrapper() {
      return typeof this.price === "number" && this.parent.parent?.type === "inventory";
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), { price: this.price });
    }
  }

  return PriceSystem;
}
