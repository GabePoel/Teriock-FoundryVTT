import { evaluateSync } from "../../helpers/utils.mjs";

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
    async prepareDerivedData() {
      super.prepareDerivedData();
      if (this.consumable) {
        const { maxQuantity, quantity } = this.getQuantities();
        this.maxQuantity = maxQuantity;
        this.quantity = quantity;
      }
    }

    /**
     * @returns {object}
     */
    getQuantities() {
      let maxQuantity = null;
      let quantity = this.quantity || 0;
      if (this.consumable) {
        if (this.maxQuantityRaw) {
          if (!Number.isNaN(parseInt(this.maxQuantityRaw))) {
            maxQuantity = parseInt(this.maxQuantityRaw);
          } else {
            maxQuantity = evaluateSync(this.maxQuantityRaw, this.parent.getActor()?.getRollData());
          }
          quantity = Math.min(maxQuantity || Infinity, quantity || 0);
        }
      }
      return {
        maxQuantity: maxQuantity,
        quantity: quantity,
      };
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
