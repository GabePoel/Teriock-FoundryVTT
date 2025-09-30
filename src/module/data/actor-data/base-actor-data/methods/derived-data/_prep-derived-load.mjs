/**
 * Applies encumbrance level based on carried weight and cumbersome equipment.
 * Calculates encumbrance level (0-3) based on weight thresholds and cumbersome properties.
 *
 * Relevant wiki pages:
 * - [Carrying Capacity](https://wiki.teriock.com/index.php/Core:Carrying_Capacity)
 * - [Encumbered](https://wiki.teriock.com/index.php/Condition:Encumbered)
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepDerivedEncumbrance(actorData) {
  let newEncumbranceLevel = 0;
  if (actorData.weight.carried >= actorData.carryingCapacity.light) {
    newEncumbranceLevel = 1;
  }
  if (actorData.weight.carried >= actorData.carryingCapacity.heavy) {
    newEncumbranceLevel = 2;
  }
  if (actorData.weight.carried >= actorData.carryingCapacity.max) {
    newEncumbranceLevel = 3;
  }
  newEncumbranceLevel = Math.min(
    actorData.encumbranceLevel + newEncumbranceLevel,
    3,
  );
  actorData.encumbranceLevel = newEncumbranceLevel;
}

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

/**
 * Calculates the total weight carried by the actor.
 * Includes equipped equipment weight and money weight.
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepDerivedWeightCarried(actorData) {
  const actor = actorData.parent;
  let equipmentWeight = 0;
  for (const e of actor.equipment) {
    equipmentWeight += e.system.weight.total;
  }
  actorData.weight.equipment = equipmentWeight;
  actorData.weight.carried = Math.ceil(
    actorData.weight.equipment + actorData.weight.money,
  );
  actorData.weight.value =
    actorData.weight.equipment +
    actorData.weight.money +
    actorData.weight.self.value;
}
