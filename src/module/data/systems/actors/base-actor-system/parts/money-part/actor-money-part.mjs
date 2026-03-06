import { currencyOptions } from "../../../../../../constants/options/currency-options.mjs";
import { objectMap } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles money.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorMoneyPartInterface}
     * @mixin
     */
    class ActorMoneyPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          interestRate: new fields.NumberField({
            initial: 1,
            integer: false,
            label: "Interest Rate",
          }),
          money: new fields.SchemaField({
            ...objectMap(currencyOptions, (o) => currencyField(o.name)),
            total: currencyField("Total Money", false),
            debt: currencyField("Debt", false),
          }),
        });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        for (const v of Object.keys(currencyOptions)) {
          const k = v.slice(0, 3);
          rollData[`money.${k}.num`] = this.money[v];
          rollData[`money.${k}.val`] =
            TERIOCK.options.currency[v].value * this.money[v];
          rollData[`money.${k}.weight`] =
            TERIOCK.options.currency[v].weight * this.money[v];
        }
        rollData[`money.debt`] = this.money.debt;
        rollData[`money.total`] = this.money.total;
        return rollData;
      }

      /**
       * Actor pays money.
       * @param {number} amount - The amount of gold-equivalent money to pay.
       * @param {Teriock.Parameters.Actor.PayMode} mode - Exact change or the closest denomination, rounded up.
       * @returns {Promise<void>}
       */
      async takePay(amount, mode) {
        await this.parent.hookCall("takePay", { scope: { amount, mode } });

        // Get current money state
        const currentMoney = { ...this.money };

        // Calculate total available wealth in gold value
        const totalWealth = Object.keys(TERIOCK.options.currency).reduce(
          (total, currency) => {
            return (
              total +
              (currentMoney[currency] || 0) *
                TERIOCK.options.currency[currency].value
            );
          },
          0,
        );

        // If not enough money, add to debt and exit
        if (totalWealth < amount) {
          const shortfall = amount - totalWealth;
          await this.parent.update({
            "system.money.debt": currentMoney.debt + shortfall,
          });
          return;
        }

        // Create an array of currencies sorted by value (highest first)
        const currencies = Object.entries(TERIOCK.options.currency)
          .sort(([, a], [, b]) => b.value - a.value)
          .map(([key, config]) => ({
            key,
            ...config,
            current: currentMoney[key] || 0,
          }));

        let remainingAmount = amount;
        const toDeduct = {};

        // First pass: Deduct currencies starting from the highest value
        for (const currency of currencies) {
          if (remainingAmount <= 0) {
            break;
          }

          const canTake = Math.min(
            currency.current,
            Math.floor(remainingAmount / currency.value),
          );
          if (canTake > 0) {
            toDeduct[currency.key] = canTake;
            remainingAmount -= canTake * currency.value;
          }
        }

        // If we still need to pay more, take higher denominations for change
        if (remainingAmount > 0) {
          for (const currency of currencies) {
            if (remainingAmount <= 0) {
              break;
            }

            const alreadyTaken = toDeduct[currency.key] || 0;
            const stillHave = currency.current - alreadyTaken;

            if (stillHave > 0) {
              toDeduct[currency.key] = (toDeduct[currency.key] || 0) + 1;
              remainingAmount -= currency.value;
              break;
            }
          }
        }

        // Calculate change needed (will be negative if we overpaid)
        const changeNeeded = -remainingAmount;

        // Prepare update object
        const updateData = {};

        // Deduct the currencies we're spending
        for (const [currencyKey, amountToDeduct] of Object.entries(toDeduct)) {
          updateData[`system.money.${currencyKey}`] =
            currentMoney[currencyKey] - amountToDeduct;
        }

        // Handle change for exact mode
        if (mode === "exact" && changeNeeded > 0) {
          let changeRemaining = changeNeeded;

          // Give change using the largest denominations possible
          for (const currency of currencies) {
            if (changeRemaining <= 0) {
              break;
            }

            const changeAmount = Math.floor(changeRemaining / currency.value);
            if (changeAmount > 0) {
              const currentAmount =
                updateData[`system.money.${currency.key}`] !== undefined
                  ? updateData[`system.money.${currency.key}`]
                  : currentMoney[currency.key];

              updateData[`system.money.${currency.key}`] =
                currentAmount + changeAmount;
              changeRemaining -= changeAmount * currency.value;
            }
          }
        }

        // Apply the update
        await this.parent.update(updateData);
      }
    }
  );
};

/**
 * Creates a currency field definition for tracking different types of money.
 * @param {string} label - The display label for this currency type
 * @param {boolean} [integer] - If value must be an integer.
 */
function currencyField(label, integer = true) {
  return new fields.NumberField({
    initial: 0,
    integer: integer,
    label: label,
    min: 0,
  });
}
