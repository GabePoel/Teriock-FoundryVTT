/** @import TeriockBaseActorData from "../base-data.mjs"; */

/**
 * @param {TeriockBaseActorData} system
 * @returns {object}
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
 * @param {TeriockBaseActorData} system
 * @param {object} data
 * @returns {void}
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
 * @param {TeriockBaseActorData} system
 * @param {object} data
 * @returns {void}
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
 * @param {TeriockBaseActorData} system
 * @param {object} data
 * @returns {void}
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
 * @param {TeriockBaseActorData} system
 * @param {object} data
 * @returns {void}
 */
function tradecraftsData(system, data) {
  for (const [key, val] of Object.entries(system.tradecrafts)) {
    data[key] = val.extra;
  }
  return data;
}
