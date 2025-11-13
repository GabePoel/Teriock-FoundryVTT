/**
 * Actor data model mixin that handles payment.
 * @mixin
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockBaseActorData
     */
    class ActorPayPart extends Base {
      /**
       * Actor pays money.
       * @param {number} amount - The amount of gold-equivalent money to pay.
       * @param {Teriock.Parameters.Actor.PayMode} mode - Exact change or the closest denomination, rounded up.
       */
      async takePay(amount, mode) {
        const data = {
          amount,
          mode,
        };
        await this.parent.hookCall("takePay", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        mode = data.mode;
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

        // Create array of currencies sorted by value (highest first)
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
