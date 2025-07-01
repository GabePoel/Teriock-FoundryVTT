/** @import TeriockBaseActorData from "../base-data.mjs"; */

/**
 * Gets roll data for an actor system, including basic stats, attack data, class ranks, and tradecrafts.
 * @param {TeriockBaseActorData} system - The actor system to get roll data for.
 * @returns {object} Object containing all roll data for the actor.
 * @private
 */
export function _getRollData(system) {
  const data = {};
  basicData(system, data);
  attackData(system, data);
  classRanksData(system, data);
  tradecraftsData(system, data);
  return data;
}

/**
 * Adds basic actor data to the roll data object.
 * Includes attributes, health, mana, and damage values.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function basicData(system, data) {
  const attr = system.attributes;
  Object.assign(data, {
    lvl: system.lvl,
    pres: system.pres,
    usp: system.usp,
    unp: system.unp,
    rank: system.rank,
    p: system.p,
    f: system.f,
    int: attr.int.value,
    mov: attr.mov.value,
    per: attr.per.value,
    snk: attr.snk.value,
    str: attr.str.value,
    hp: system.hp.value,
    mp: system.mp.value,
    hpMax: system.hp.max,
    mpMax: system.mp.max,
    tempHp: system.hp.temp,
    tempMp: system.mp.temp,
    hand: system.damage.hand,
    foot: system.damage.foot,
    mouth: system.damage.mouth,
    bshield: system.damage.bucklerShield,
    lshield: system.damage.largeShield,
    tshield: system.damage.towerShield,
    standard: system.damage.standard,
  });
}

/**
 * Adds attack-related data to the roll data object.
 * Includes armor value, shield bonus, and attack penalty.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function attackData(system, data) {
  Object.assign(data, {
    av0:
      system.piercing === "av0" ||
      system.piercing === "ub" ||
      system?.primaryAttacker?.effectKeys?.property?.has("av0") ||
      system?.primaryAttacker?.effectKeys?.property?.has("ub")
        ? 2
        : 0,
    sb: system.sb ? 1 : 0,
    atkPen: system.attackPenalty,
  });
}

/**
 * Adds class rank data to the roll data object.
 * Counts the number of ranks in each class and archetype.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function classRanksData(system, data) {
  const actor = system.parent;
  const rankKeys = [
    "fla",
    "lif",
    "nat",
    "nec",
    "sto",
    "arc",
    "ass",
    "cor",
    "ran",
    "thi",
    "ber",
    "due",
    "kni",
    "pal",
    "vet",
    "mag",
    "sem",
    "war",
  ];
  for (const key of rankKeys) data[key] = 0;

  for (const rank of actor.itemTypes.rank) {
    const classKey = rank.system.className?.slice(0, 3).toLowerCase();
    const archetypeKey = rank.system.archetype?.slice(0, 3).toLowerCase();

    if (classKey in data) data[classKey]++;
    if (archetypeKey in data) data[archetypeKey]++;
  }
}

/**
 * Adds tradecraft data to the roll data object.
 * Includes extra values for each tradecraft.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {object} The updated roll data object.
 * @private
 */
function tradecraftsData(system, data) {
  for (const [key, val] of Object.entries(system.tradecrafts)) {
    data[key] = val.extra;
  }
  return data;
}
