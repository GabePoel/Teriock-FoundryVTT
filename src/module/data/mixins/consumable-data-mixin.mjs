import { smartEvaluateSync } from "../../helpers/utils.mjs";

/**
 * Mixin that provides consumable document functionality.
 * Adds quantity management, automatic consumption, and quantity validation capabilities.
 *
 * @param {typeof ChildDataModel} Base - The base class to mix in with.
 */
export default (Base) => {
  return class ConsumableDataMixin extends Base {
    /**
     * Adds one unit to the consumable item.
     * Increments the quantity by 1, respecting maximum quantity limits.
     * @returns {Promise<void>} Promise that resolves when the gain is complete.
     */
    async gainOne() {
      if (this.consumable) {
        let quantity = this.quantity;
        if (!quantity) {
          quantity = 0;
        }
        let maxQuantity = this.maxQuantity.derived;
        if (maxQuantity) {
          quantity = Math.min(maxQuantity, quantity + 1);
        } else {
          quantity = Math.max(0, quantity + 1);
        }
        await this.parent.update({
          "system.quantity": quantity,
        });
      }
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.consumable) {
        if (!this.maxQuantity.raw) {
          this.maxQuantity.derived = Infinity;
        } else {
          this.maxQuantity.derived = smartEvaluateSync(
            this.maxQuantity.raw,
            this.parent,
          );
        }
        this.quantity = Math.max(
          Math.min(this.maxQuantity.derived, this.quantity),
          0,
        );
      }
    }

    /** @inheritDoc */
    async use(options) {
      await super.use(options);
      if (!this.parent.getFlag("teriock", "dontConsume")) {
        await this.useOne();
      }
      await this.parent.setFlag("teriock", "dontConsume", false);
    }

    /**
     * Consumes one unit of the consumable item.
     * Decrements the quantity by 1, ensuring it doesn't go below 0.
     * @returns {Promise<void>} Promise that resolves when consumption is complete.
     */
    async useOne() {
      if (this.consumable) {
        const quantity = this.quantity;
        await this.parent.update({
          "system.quantity": Math.max(0, quantity - 1),
        });
      }
    }
  };
};
