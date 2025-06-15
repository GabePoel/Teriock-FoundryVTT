import { evaluateSync } from "../../helpers/utils.mjs";

const TeriockConsumableMixin = (Base) => class TeriockConsumableMixin extends Base {

  /** @override */
  async use(options) {
    await super.use(options);
    this.useOne();
  }

  /** @override */
  async prepareDerivedData() {
    super.prepareDerivedData();
    if (this.system?.consumable) {
      const { maxQuantity, quantity } = this.getQuantities();
      this.system.maxQuantity = maxQuantity;
      this.system.quantity = quantity;
    }
  }

  getQuantities() {
    let maxQuantity = null;
    let quantity = this.system?.quantity || 0;
    if (this.system?.consumable) {
      if (this.system?.maxQuantityRaw) {
        if (!Number.isNaN(parseInt(this.system?.maxQuantityRaw))) {
          maxQuantity = parseInt(this.system?.maxQuantityRaw);
        } else {
          maxQuantity = evaluateSync(this.system.maxQuantityRaw, this.getActor()?.getRollData());
        }
        quantity = Math.min(maxQuantity || Infinity, quantity || 0);
      }
    }
    return {
      maxQuantity: maxQuantity,
      quantity: quantity,
    }
  }

  async useOne() {
    if (this.system.consumable) {
      const quantity = this.system.quantity;
      await this.update({
        'system.quantity': Math.max(0, quantity - 1),
      });
      if (this.system.quantity <= 0 && this.type === 'equipment') {
        await this.unequip();
      } else if (this.system.quantity <= 0 && this.type === 'resource') {
        await this.setForceDisabled(true);
      }
    }
  }

  async gainOne() {
    if (this.system.consumable) {
      let quantity = this.system.quantity;
      let maxQuantity = this.system.maxQuantity;
      if (maxQuantity) {
        quantity = Math.min(maxQuantity, quantity + 1);
      } else {
        quantity = Math.max(0, quantity + 1);
      }
      await this.update({
        'system.quantity': quantity,
      });
      if (this.type === 'resource') {
        await this.setForceDisabled(false);
      }
    }
  }
}

export default TeriockConsumableMixin;