import currencyConfig from "../../../../../../constants/config/currency-config.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * @import { NumberFieldOptions } from "@common/data/_types.mjs";
 */

/**
 * Actor data model that handles money.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorMoneyPart & Teriock.Models.ActorMoneyPartData>}
 */
export default function ActorMoneyPart(Base) {
  /**
   * @implements {Teriock.Models.ActorMoneyPartData}
   * @mixin
   * @property {AnyActor} parent
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

    /**
     * Adds an amount of money to a "wallet" (which is just a currency config object).
     * @param {Record<Teriock.Keys.Currency, number>} wallet
     * @param {{ key: Teriock.Keys.Currency, value: number }[]} currencies
     * @param {number} amount
     */
    #addToWallet(wallet, currencies, amount) {
      const precision = currencies.at(-1).value;
      for (const currency of currencies) {
        if (amount <= 0) { break; }
        const count = (amount / currency.value).toNearest(1, "floor");
        wallet[currency.key] += count;
        amount = (amount - count * currency.value).toNearest(precision);
      }
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
      }, 0).toNearest(TERIOCK.config.system.unitPrecision);
    }

    /**
     * Actor pays money. A negative amount is money gained.
     * @param {number} amount
     * @param {Teriock.Keys.PayMode} [mode]
     * @returns {Promise<void>}
     */
    async takePay(amount, mode = "exact") {
      await this.parent.hookCall("takePay", { scope: { amount, mode } });

      const currencies = Object.entries(TERIOCK.config.currency).map(([key, config]) => ({
        held: Math.max(0, this.money[key] || 0),
        key,
        value: config.conversion,
      })).sort((a, b) => b.value - a.value);
      const wallet = Object.fromEntries(currencies.map(c => [c.key, c.held]));
      const precision = currencies.at(-1).value;

      let owed = (amount || 0).toNearest(precision);
      let debt = this.money.debt.toNearest(precision);

      if (owed < 0) {
        // Step 0: Pays off any outstanding debt first
        const debtPaid = Math.min(debt, -owed);
        debt = (debt - debtPaid).toNearest(precision);
        this.#addToWallet(wallet, currencies, (-owed - debtPaid).toNearest(precision));
      } else {
        // Step 1: Spend highest denomination to smallest
        for (const currency of currencies) {
          if (owed <= 0) { break; }
          const spent = Math.min(wallet[currency.key], (owed / currency.value).toNearest(1, "floor"));
          wallet[currency.key] -= spent;
          owed = (owed - spent * currency.value).toNearest(precision);
        }

        // Step 2: Break the smallest denomination that covers the remainder
        const breakable = currencies.filter(c => wallet[c.key] > 0).pop();
        if (owed > 0 && breakable) {
          wallet[breakable.key] -= 1;
          if (mode === "exact") {
            this.#addToWallet(wallet, currencies, (breakable.value - owed).toNearest(precision));
          }
          owed = 0;
        }

        // Step 3: Anything that still can't be paid for is taken on as debt
        debt = (debt + owed).toNearest(precision);
      }

      await this.parent.update({ "system.money": { ...wallet, debt } });
    }
  }

  return ActorMoneyPart;
}

/**
 * Creates a currency field definition for tracking different types of money.
 * @param {NumberFieldOptions} [options]
 */
function currencyField(options = {}) {
  return new fields.NumberField({ initial: 0, integer: true, min: 0, nullable: false, placeholder: "0", ...options });
}
