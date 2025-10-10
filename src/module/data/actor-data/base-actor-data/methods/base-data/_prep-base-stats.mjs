import { docSort } from "../../../../../helpers/utils.mjs";

/**
 * Prepares level-based bonuses for the actor.
 * Calculates presence, rank, proficiency, and fluency bonuses based on level.
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareBonuses(actorData) {
  const lvl = actorData.scaling.lvl;
  actorData.scaling.br = Math.max(
    ...actorData.parent.species.map((s) => s.system.br),
  );
  let scale = lvl;
  if (actorData.scaling.brScale) {
    scale = actorData.scaling.br;
  }
  actorData.scaling.scale = scale;
  actorData.presence = {
    min: 0,
    value: 0,
    max: Math.max(1, Math.floor(1 + (lvl + 1) / 5)),
  };
  actorData.scaling.rank = Math.max(0, Math.floor((lvl - 1) / 5));
  actorData.scaling.p = Math.max(0, Math.floor(1 + (scale - 7) / 10));
  actorData.scaling.f = Math.max(0, Math.floor((scale - 2) / 5));
}

/**
 * Prepares hit points and mana points derived data.
 * Calculates maximum HP/MP from base values and rank bonuses, including die boxes for the character sheet.
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareHpMp(actorData) {
  const diceLimit = Math.floor(actorData.scaling.lvl / 5);
  actorData.hp.base = 0;
  actorData.mp.base = 0;
  let hpDieBox = "";
  let mpDieBox = "";
  actorData.hpDice = {};
  actorData.mpDice = {};
  docSort(actorData.parent.species).forEach((species) => {
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
  docSort(actorData.parent.ranks)
    .slice(0, diceLimit)
    .forEach((rank) => {
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
  docSort(actorData.parent.mounts)
    .slice(0, diceLimit)
    .forEach((mount) => {
      if (mount.system.applyHp) {
        actorData.hp.base += mount.system.totalHp;
        hpDieBox += mount.system.renderedHitDice;
        Object.assign(actorData.hpDice, mount.system.hpDice);
      }
      if (mount.system.applyMp) {
        actorData.mp.base += mount.system.totalMp;
        mpDieBox += mount.system.renderedManaDice;
        Object.assign(actorData.mpDice, mount.system.mpDice);
      }
    });
  let hpMax = Math.max(1, actorData.hp.base);
  let mpMax = Math.max(1, actorData.mp.base);
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
