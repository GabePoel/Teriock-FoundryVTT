/**
 * Prepares level-based bonuses for the actor.
 * Calculates presence, rank, proficiency, and fluency bonuses based on level.
 *
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
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
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareHpMp(actorData) {
  const diceLimit = Math.floor(actorData.lvl / 5);
  actorData.hp.base = 0;
  actorData.mp.base = 0;
  let hpDieBox = "";
  let mpDieBox = "";
  actorData.hpDice = {};
  actorData.mpDice = {};
  actorData.parent.species.forEach((species) => {
    if (species.system.applyHp) {
      actorData.hp.base += species.system.totalHp;
      hpDieBox += species.system.renderedHitDice;
      Object.assign(actorData.hpDice, species.system.hpDice);
    }
    if (species.system.applyMp) {
      actorData.mp.base += species.system.totalMp;
      mpDieBox += species.system.renderedManaDice;
      Object.assign(actorData.mpDice, species.system.mpDice);
    }
  });
  actorData.parent.ranks.slice(0, diceLimit).forEach((rank) => {
    if (rank.system.applyHp) {
      actorData.hp.base += rank.system.totalHp;
      hpDieBox += rank.system.renderedHitDice;
      Object.assign(actorData.hpDice, rank.system.hpDice);
    }
    if (rank.system.applyMp) {
      actorData.mp.base += rank.system.totalMp;
      mpDieBox += rank.system.renderedManaDice;
      Object.assign(actorData.mpDice, rank.system.mpDice);
    }
  });
  let hpMax = actorData.hp.base;
  let mpMax = actorData.mp.base;
  actorData.hp.max = hpMax;
  actorData.hp.min = -Math.floor(hpMax / 2);
  actorData.hp.value = Math.min(actorData.hp.value, hpMax);
  actorData.mp.max = mpMax;
  actorData.mp.min = -Math.floor(mpMax / 2);
  actorData.mp.value = Math.min(actorData.mp.value, mpMax);
  actorData.sheet.dieBox = {
    hpDice: hpDieBox,
    mpDice: mpDieBox,
  };
}
