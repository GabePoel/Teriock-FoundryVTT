export function _prepareEncumbrance(actor) {
  let encumbranceLevel = 0;
  if (actor.system.weightCarried >= actor.system.carryingCapacity.light) {
    encumbranceLevel = 1;
  }
  if (actor.system.weightCarried >= actor.system.carryingCapacity.heavy) {
    encumbranceLevel = 2;
  }
  if (actor.system.weightCarried >= actor.system.carryingCapacity.max) {
    encumbranceLevel = 3;
  }
  const hasCumbersome = actor.itemTypes.equipment
    .some(item => item.system.equipped && Array.isArray(item.system.properties) && item.system.properties.includes("cumbersome"));
  if (hasCumbersome) {
    encumbranceLevel += 1;
  }
  encumbranceLevel = Math.min(encumbranceLevel, 3);
  actor.system.encumbranceLevel = encumbranceLevel;
}

export function _prepareMoney(actor) {
  const money = actor.system.money;
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
  actor.system.money.total = total;
  actor.system.moneyWeight = Math.round(totalWeight * 100) / 100 || 0;
}

export function _prepareWeightCarried(actor) {
  const weight = actor.itemTypes.equipment
    .filter(i => i.system.equipped)
    .reduce((sum, i) => {
      return sum + (i.system.weight || 0);
    }, 0);
  const moneyWeight = Number(actor.system.moneyWeight) || 0;
  actor.system.weightCarried = Math.ceil(weight + moneyWeight);
}