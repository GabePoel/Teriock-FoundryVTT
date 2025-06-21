import { smartEvaluateSync } from "../../helpers/utils.mjs";

export const ConsumableDataMixin = (Base) =>
  class ConsumableDataMixin extends Base {
    /**
     * @param {object} options
     * @returns {Promise<void>}
     * @override
     */
    async use(options) {
      await super.use(options);
      this.useOne();
    }

    /** @override */
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
          0
        );
      }
    }

    /**
     * @returns {Promise<void>}
     */
    async useOne() {
      if (this.consumable) {
        const quantity = this.quantity;
        await this.parent.update({
          "system.quantity": Math.max(0, quantity - 1),
        });
      }
    }

    /**
     * @returns {Promise<void>}
     */
    async gainOne() {
      if (this.consumable) {
        let quantity = this.quantity;
        let maxQuantity = this.maxQuantity;
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
  };
