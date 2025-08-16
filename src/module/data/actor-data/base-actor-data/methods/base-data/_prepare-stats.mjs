import TeriockRankData from "../../../../item-data/rank-data/rank-data.mjs";

/**
 * Prepares level-based bonuses for the actor.
 * Calculates presence, rank, proficiency, and fluency bonuses based on level.
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareBonuses(actorData) {
  const lvl = actorData.lvl;
  Object.assign(actorData, {
    presence: {
      min: 0,
      value: 0,
      max: Math.max(1, Math.floor(1 + (lvl + 1) / 5)),
    },
    rank: Math.max(0, Math.floor((lvl - 1) / 5)),
    p: Math.max(0, Math.floor(1 + (lvl - 7) / 10)),
    f: Math.max(0, Math.floor((lvl - 2) / 5)),
  });
}

/**
 * Prepares hit points and mana points derived data.
 * Calculates maximum HP/MP from base values and rank bonuses, including die boxes for the character sheet.
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareHpMp(actorData) {
  const actor = actorData.parent;
  const items = actor.itemTypes.rank;
  const diceLimit = Math.floor(actorData.lvl / 5);
  let hpMax = actorData.hp.base,
    mpMax = actorData.mp.base;
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
  actorData.hp.max = hpMax;
  actorData.hp.min = -Math.floor(hpMax / 2);
  actorData.hp.value = Math.min(actorData.hp.value, hpMax);
  actorData.mp.max = mpMax;
  actorData.mp.min = -Math.floor(mpMax / 2);
  actorData.mp.value = Math.min(actorData.mp.value, mpMax);
  actorData.sheet.dieBox = { hitDice: hitDieBox, manaDice: manaDieBox };
}

/**
 * Renders a die box HTML element for the character sheet.
 * Creates a clickable die icon that shows whether the die has been spent or not.
 *
 * @param {TeriockRankData} rankData - The rank data containing die information.
 * @param {string} type - The type of die ("hit" or "mana").
 * @param {string} dieProp - The property name for the die value.
 * @param {boolean} spent - Whether the die has been spent.
 * @returns {string} HTML string for the die box element.
 * @private
 */
function _renderDieBox(rankData, type, dieProp, spent) {
  const iconClass = spent ? "fa-light" : "fa-solid";
  const rollClass = spent ? "rolled" : "unrolled";
  const action = spent
    ? ""
    : `data-action='roll${type === "hit" ? "Hit" : "Mana"}Die'`;
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
