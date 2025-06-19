/** @import TeriockBaseActorData from "../../base-data.mjs" */

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 */
export function _prepareEncumbrance(system) {
  const actor = system.parent;
  let encumbranceLevel = 0;
  if (system.weightCarried >= system.carryingCapacity.light) {
    encumbranceLevel = 1;
  }
  if (system.weightCarried >= system.carryingCapacity.heavy) {
    encumbranceLevel = 2;
  }
  if (system.weightCarried >= system.carryingCapacity.max) {
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
  system.encumbranceLevel = encumbranceLevel;
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
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
  system.money.total = total;
  system.moneyWeight = Math.round(totalWeight * 100) / 100 || 0;
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 */
export function _prepareWeightCarried(system) {
  const actor = system.parent;
  const weight = actor.itemTypes.equipment
    .filter((i) => i.system.equipped)
    .reduce((sum, i) => {
      return sum + (i.system.weight || 0);
    }, 0);
  const moneyWeight = Number(system.moneyWeight) || 0;
  system.weightCarried = Math.ceil(weight + moneyWeight);
}
