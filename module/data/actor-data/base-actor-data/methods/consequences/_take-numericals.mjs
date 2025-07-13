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
  await actorData.parent.update({ "system.hp.value": value, "system.hp.temp": temp });
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
  await actorData.parent.update({ "system.mp.value": value, "system.mp.temp": temp });
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
  await actorData.parent.update({ "system.wither.value": Math.min(Math.max(0, actorData.wither.value + amount), 100) });
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
  await actorData.parent.update({ "system.hp.temp": Math.max(actorData.hp.temp + amount, 0) });
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
  await actorData.parent.update({ "system.mp.temp": Math.max(actorData.mp.temp + amount, 0) });
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
    await actorData.parent.toggleStatusEffect("asleep", { active: true, overlay: true });
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
      statuses: ["dead", "down", "blind", "unconscious", "prone", "anosmatic", "mute"],
      type: "effect",
      img: "systems/teriock/assets/conditions/dead.svg",
      flags: {
        core: {
          overlay: true,
        },
      },
    };
    await actorData.parent.createEmbeddedDocuments("ActiveEffect", [effectData]);
  }
}
