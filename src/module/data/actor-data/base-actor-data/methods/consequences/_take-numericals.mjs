import { currencyOptions } from "../../../../../helpers/constants/currency-options.mjs";

/**
 * Relevant wiki pages:
 * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeDamage(actorData, amount) {
  const { hp } = actorData;
  const temp = Math.max(0, hp.temp - amount);
  amount = Math.max(0, amount - hp.temp);
  const value = Math.max(hp.min, hp.value - amount);
  await actorData.parent.update({
    "system.hp.value": value,
    "system.hp.temp": temp,
  });
}

/**
 * Relevant wiki pages:
 * - [Mana Drain](https://wiki.teriock.com/index.php/Drain:Mana)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeDrain(actorData, amount) {
  const { mp } = actorData;
  const temp = Math.max(0, mp.temp - amount);
  amount = Math.max(0, amount - mp.temp);
  const value = Math.max(mp.min, mp.value - amount);
  await actorData.parent.update({
    "system.mp.value": value,
    "system.mp.temp": temp,
  });
}

/**
 * Relevant wiki pages:
 * - [Wither](https://wiki.teriock.com/index.php/Drain:Wither)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeWither(actorData, amount) {
  const { wither } = actorData;
  const value = Math.min(wither.max, wither.value + Number(amount));
  await actorData.parent.update({ "system.wither.value": value });
}

/**
 * Relevant wiki pages:
 * - [Healing](https://wiki.teriock.com/index.php/Core:Healing)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeHeal(actorData, amount) {
  const { hp } = actorData;
  const value = Math.min(hp.max, hp.value + amount);
  await actorData.parent.update({ "system.hp.value": value });
}

/**
 * Relevant wiki pages:
 * - [Revitalizing](https://wiki.teriock.com/index.php/Core:Revitalizing)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeRevitalize(actorData, amount) {
  const { mp } = actorData;
  const value = Math.min(mp.max, mp.value + amount);
  await actorData.parent.update({ "system.mp.value": value });
}

/**
 * Relevant wiki pages:
 * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeSetTempHp(actorData, amount) {
  await actorData.parent.update({ "system.hp.temp": amount });
}

/**
 * Relevant wiki pages:
 * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeSetTempMp(actorData, amount) {
  await actorData.parent.update({ "system.mp.temp": amount });
}

/**
 * Relevant wiki pages:
 * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeGainTempHp(actorData, amount) {
  await actorData.parent.update({
    "system.hp.temp": Math.max(actorData.hp.temp + amount, 0),
  });
}

/**
 * Relevant wiki pages:
 * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeGainTempMp(actorData, amount) {
  await actorData.parent.update({
    "system.mp.temp": Math.max(actorData.mp.temp + amount, 0),
  });
}

/**
 * Relevant wiki pages:
 * - [Swift Sleep Aura](https://wiki.teriock.com/index.php/Ability:Swift_Sleep_Aura)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeSleep(actorData, amount) {
  if (actorData.hp.value <= amount) {
    await actorData.parent.toggleStatusEffect("asleep", {
      active: true,
      overlay: true,
    });
  }
}

/**
 * Relevant wiki pages:
 * - [Death Ray](https://wiki.teriock.com/index.php/Ability:Death_Ray)
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount
 * @returns {Promise<void>}
 */
export async function _takeKill(actorData, amount) {
  if (actorData.hp.value <= amount) {
    const effectData = {
      name: "Forced Dead",
      statuses: [
        "dead",
        "down",
        "blind",
        "unconscious",
        "prone",
        "anosmatic",
        "mute",
      ],
      type: "consequence",
      img: "systems/teriock/assets/conditions/dead.svg",
      flags: {
        core: {
          overlay: true,
        },
      },
    };
    await actorData.parent.createEmbeddedDocuments("ActiveEffect", [
      effectData,
    ]);
  }
}

/**
 * Pays the specified amount from an actor, using exact change if requested.
 * Falls back to debt if funds are insufficient.
 *
 * @param {TeriockBaseActorData} actorData
 * @param {number} amount - Gold-equivalent amount to pay.
 * @param {"exact" | "greedy"} mode
 * @returns {Promise<void>}
 */
export async function _takePay(actorData, amount, mode = "greedy") {
  // Get current money state
  const currentMoney = { ...actorData.money };

  // Calculate total available wealth in gold value
  const totalWealth = Object.keys(currencyOptions).reduce((total, currency) => {
    return (
      total + (currentMoney[currency] || 0) * currencyOptions[currency].value
    );
  }, 0);

  // If not enough money, add to debt and exit
  if (totalWealth < amount) {
    const shortfall = amount - totalWealth;
    await actorData.parent.update({
      "system.money.debt": currentMoney.debt + shortfall,
    });
    return;
  }

  // Create array of currencies sorted by value (highest first)
  const currencies = Object.entries(currencyOptions)
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
    if (remainingAmount <= 0) break;

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
      if (remainingAmount <= 0) break;

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
      if (changeRemaining <= 0) break;

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
  await actorData.parent.update(updateData);
}
