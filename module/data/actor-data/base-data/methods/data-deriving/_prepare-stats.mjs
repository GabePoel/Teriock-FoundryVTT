/** @import TeriockBaseActorData from "../../base-data.mjs"; */
import TeriockRankData from "../../../../item-data/rank-data/rank-data.mjs";

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 * @private
 */
export function _prepareAttributes(system) {
  const { attributes, size, f, p } = system;
  Object.entries(attributes).forEach(([key, attr]) => {
    const bonus = attr.saveFluent ? f : attr.saveProficient ? p : 0;
    system[`${key}Save`] = attr.value + bonus;
  });
  const mov = attributes.mov.value;
  const str = attributes.str.value;
  const strFactor = size < 5 ? str : str + Math.pow(size - 5, 2);
  const base = 65 + 20 * strFactor;
  system.movementSpeed.value = 30 + 10 * mov + system.movementSpeed.base;
  system.carryingCapacity = {
    light: base,
    heavy: base * 2,
    max: base * 3,
  };
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 * @private
 */
export function _prepareBonuses(system) {
  const lvl = system.lvl;
  Object.assign(system, {
    pres: Math.max(1, Math.floor(1 + (lvl + 1) / 5)),
    rank: Math.max(0, Math.floor((lvl - 1) / 5)),
    p: Math.max(0, Math.floor(1 + (lvl - 7) / 10)),
    f: Math.max(0, Math.floor((lvl - 2) / 5)),
  });
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 * @private
 */
export function _prepareHpMp(system) {
  const actor = system.parent;
  const items = actor.itemTypes.rank;
  const diceLimit = Math.floor(system.lvl / 5);
  let hpMax = system.hp.base,
    mpMax = system.mp.base;
  let hitDieBox = "",
    manaDieBox = "";
  items.slice(0, diceLimit).forEach((rank) => {
    const rankData = rank.system;
    if (rankData instanceof TeriockRankData) {
      if (rankData.hp) {
        hpMax += rankData.hp;
        const spent = rankData.hitDieSpent;
        hitDieBox += _renderDieBox(rankData, "hit", "hitDie", spent);
      }
      if (rankData.mp) {
        mpMax += rankData.mp;
        const spent = rankData.manaDieSpent;
        manaDieBox += _renderDieBox(rankData, "mana", "manaDie", spent);
      }
    }
  });
  system.hp.max = hpMax;
  system.hp.min = -Math.floor(hpMax / 2);
  system.hp.value = Math.min(system.hp.value, hpMax);
  system.mp.max = mpMax;
  system.mp.min = -Math.floor(mpMax / 2);
  system.mp.value = Math.min(system.mp.value, mpMax);
  system.sheet.dieBox = { hitDice: hitDieBox, manaDice: manaDieBox };
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 * @private
 */
export function _preparePresence(system) {
  const actor = system.parent;
  const equipped = actor.itemTypes.equipment.filter((i) => i.system.equipped);
  let usp = equipped.reduce((sum, item) => sum + (item.system.tier.derived || 0), 0);
  usp = Math.min(usp, system.pres);
  const unp = system.pres - usp;
  Object.assign(system, {
    unp,
    usp,
    attributes: {
      ...system.attributes,
      unp: { ...system.attributes.unp, value: unp },
    },
    presence: {
      max: system.pres,
      min: 0,
      value: usp,
    },
  });
}

/**
 * @param {TeriockRankData} rankData
 * @param {string} type
 * @param {string} dieProp
 * @param {boolean} spent
 * @returns {string}
 * @private
 */
function _renderDieBox(rankData, type, dieProp, spent) {
  const iconClass = spent ? "fa-light" : "fa-solid";
  const rollClass = spent ? "rolled" : "unrolled";
  const action = spent ? "" : `data-action='roll${type === "hit" ? "Hit" : "Mana"}Die'`;
  return `
    <div
      class="thover die-box ${rollClass}"
      data-die="${type}"
      data-id='${rankData.parent._id}'
      ${action}
      data-tooltip="${type === "hit" ? "Hit" : "Mana"} Die"
    >
      <i class="fa-fw ${iconClass} fa-dice-${rankData[dieProp]}"></i>
    </div>`;
}
