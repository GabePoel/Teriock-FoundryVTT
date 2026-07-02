import currencyConfig from "../../../../../../constants/config/currency-config.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles money.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorMoneyPart(Base) {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorMoneyPartData}
     * @mixin
     */
    class ActorMoneyPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          interestRate: new fields.NumberField({ initial: 1, integer: false }),
          money: new fields.SchemaField({
            ...objectMap(currencyConfig, e => currencyField({ label: e.label })),
            debt: currencyField({ integer: false, placeholder: true }),
            physical: currencyField({ integer: false, placeholder: true }),
            total: currencyField({ integer: false, placeholder: true }),
          }),
        });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        for (const k of Object.keys(currencyConfig)) {
          rollData[`money.${k}`] = this.money[k];
        }
        rollData["money.debt"] = this.money.debt;
        rollData["money.physical"] = this.money.physical;
        rollData.money = this.money.total;
        return rollData;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.money.physical = Object.keys(TERIOCK.config.currency).reduce((sum, key) => {
          this.money[key] = Math.max(0, this.money[key] || 0);
          const value = this.money[key] * TERIOCK.config.currency[key].conversion;
          return sum + value;
        }, 0).toNearest(0.01);
        this.money.total = (this.money.physical - this.money.debt).toNearest(0.01);
        this.weight.money = Object.keys(TERIOCK.config.currency).reduce((sum, key) => {
          const weight = (this.money[key] || 0) * TERIOCK.config.currency[key].weight;
          return sum + weight;
        }, 0).toNearest(0.01);
      }

      /**
       * Actor pays money.
       * @param {number} amount - The amount of gold-equivalent money to pay.
       * @param {Teriock.Keys.PayMode} mode - Exact change or the closest denomination, rounded up.
       * @returns {Promise<void>}
       */
      async takePay(amount, mode) {
        await this.parent.hookCall("takePay", { scope: { amount, mode } });

        // TODO: Rework this so that instead of this arduous automatic payment algorithm it will open some dialog.

        // Simple check to see if it's more money than the character has
        if (this.money.total < amount) {
          await this.parent.update({
            "system.money": { ...objectMap(TERIOCK.config.currency, () => 0), debt: amount - this.money.physical },
          });
          return;
        }
        const currencies = Object.entries(TERIOCK.config.currency).sort(([, a], [, b]) => b.conversion - a.conversion)
          .map(([key, config]) => ({ key, ...config, current: this.money[key] || 0 }));
        let remainingAmount = amount;
        const toDeduct = {};

        // Greedily spend currencies from highest to lowest denomination
        for (const currency of currencies) {
          if (remainingAmount <= 0) { break; }
          const canTake = Math.min(currency.current, Math.floor(remainingAmount / currency.conversion));
          if (canTake > 0) {
            toDeduct[currency.key] = canTake;
            remainingAmount -= canTake * currency.conversion;
          }
        }

        // If we still need to pay more, take higher denominations for change
        if (remainingAmount > 0) {
          for (const currency of currencies) {
            if (remainingAmount <= 0) { break; }
            const alreadyTaken = toDeduct[currency.key] || 0;
            const stillHave = currency.current - alreadyTaken;
            if (stillHave > 0) {
              toDeduct[currency.key] = (toDeduct[currency.key] || 0) + 1;
              remainingAmount -= currency.conversion;
              break;
            }
          }
        }

        // Calculate change needed (will be negative if we overpaid)
        const changeNeeded = -remainingAmount;
        const updateData = {};
        for (
          const [currencyKey, amountToDeduct] of Object.entries(toDeduct)
        ) { updateData[`system.money.${currencyKey}`] = this.money[currencyKey] - amountToDeduct; }

        // Handle change for exact mode
        if (mode === "exact" && changeNeeded > 0) {
          let changeRemaining = changeNeeded;
          for (const currency of currencies) {
            if (changeRemaining <= 0) { break; }
            const changeAmount = Math.floor(changeRemaining / currency.conversion);
            if (changeAmount > 0) {
              const currentAmount = updateData[`system.money.${currency.key}`] !== undefined
                ? updateData[`system.money.${currency.key}`]
                : this.money[currency.key];
              updateData[`system.money.${currency.key}`] = currentAmount + changeAmount;
              changeRemaining -= changeAmount * currency.conversion;
            }
          }
        }

        await this.parent.update(updateData);
      }
    }
  );
}

/**
 * Creates a currency field definition for tracking different types of money.
 * @param {NumberFieldOptions} [options]
 */
function currencyField(options = {}) {
  return new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false, placeholder: "0", ...options });
}
