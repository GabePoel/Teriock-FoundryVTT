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
export function _prepareEncumbrance(actorData) {
  const actor = actorData.parent;
  let encumbranceLevel = 0;
  if (actorData.weightCarried >= actorData.carryingCapacity.light) {
    encumbranceLevel = 1;
  }
  if (actorData.weightCarried >= actorData.carryingCapacity.heavy) {
    encumbranceLevel = 2;
  }
  if (actorData.weightCarried >= actorData.carryingCapacity.max) {
    encumbranceLevel = 3;
  }
  const hasCumbersome = actor.itemTypes.equipment.some(
    (item) =>
      item.system.equipped && Array.isArray(item.system.properties) && item.system.properties.includes("cumbersome"),
  );
  if (hasCumbersome) {
    encumbranceLevel += 1;
  }
  encumbranceLevel = Math.min(encumbranceLevel, 3);
  actorData.encumbranceLevel = encumbranceLevel;
}

/**
 * Prepares money-related derived data.
 * Calculates total money value and weight based on currency amounts and configuration.
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareMoney(system) {
  const money = system.money;
  const currencyOptions = CONFIG.TERIOCK.currencyOptions;
  const total = Object.keys(currencyOptions).reduce((sum, key) => {
    money[key] = Math.max(0, money[key] || 0);
    const value = (money[key] || 0) * currencyOptions[key].value;
    return sum + value;
  }, 0);
  const totalWeight = Object.keys(currencyOptions).reduce((sum, key) => {
    const value = (money[key] || 0) * currencyOptions[key].weight;
    return sum + value;
  }, 0);
  system.money.total = total - system.money.debt;
  system.moneyWeight = Math.round(totalWeight * 100) / 100 || 0;
}

/**
 * Calculates the total weight carried by the actor.
 * Includes equipped equipment weight and money weight.
 *
 * @param {TeriockBaseActorData} system - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareWeightCarried(system) {
  const actor = system.parent;
  const weight = actor.itemTypes.equipment.reduce((sum, i) => {
    let newWeight = i.system.weight || 0;
    if (i.system.consumable) {
      newWeight = newWeight * i.system.quantity;
    }
    return sum + newWeight;
  }, 0);
  const moneyWeight = Number(system.moneyWeight) || 0;
  system.weightCarried = Math.ceil(weight + moneyWeight);
}
