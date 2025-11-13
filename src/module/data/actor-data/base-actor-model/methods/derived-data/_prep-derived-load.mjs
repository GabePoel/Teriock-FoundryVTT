/**
 * Prepares money-related derived data.
 * Calculates total money value and weight based on currency amounts and configuration.
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepDerivedMoney(actorData) {
  const money = actorData.money;
  const currencyOptions = TERIOCK.options.currency;
  const total = Object.keys(currencyOptions).reduce((sum, key) => {
    money[key] = Math.max(0, money[key] || 0);
    const value = (money[key] || 0) * currencyOptions[key].value;
    return sum + value;
  }, 0);
  const totalWeight = Object.keys(currencyOptions).reduce((sum, key) => {
    const value = (money[key] || 0) * currencyOptions[key].weight;
    return sum + value;
  }, 0);
  actorData.money.total = total - actorData.money.debt;
  actorData.weight.money = Math.round(totalWeight * 100) / 100 || 0;
}
