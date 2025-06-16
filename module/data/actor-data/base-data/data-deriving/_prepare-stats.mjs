export function _prepareAttributes(actor) {
  const { attributes, size, f, p } = actor.system;

  Object.entries(attributes).forEach(([key, attr]) => {
    const bonus = attr.saveFluent ? f : attr.saveProficient ? p : 0;
    actor.system[`${key}Save`] = attr.value + bonus;
  });

  const mov = attributes.mov.value;
  const str = attributes.str.value;
  const strFactor = size < 5 ? str : str + Math.pow(size - 5, 2);
  const base = 65 + 20 * strFactor;

  actor.system.movementSpeed = 30 + 10 * mov;
  actor.system.carryingCapacity = {
    light: base,
    heavy: base * 2,
    max: base * 3
  };
}

export function _prepareBonuses(actor) {
  const lvl = actor.system.lvl;
  Object.assign(actor.system, {
    pres: Math.max(1, Math.floor(1 + (lvl + 1) / 5)),
    rank: Math.max(0, Math.floor((lvl - 1) / 5)),
    p: Math.max(0, Math.floor(1 + (lvl - 7) / 10)),
    f: Math.max(0, Math.floor((lvl - 2) / 5))
  });
}

export function _prepareHpMp(actor) {
  const items = actor.itemTypes.rank;
  const diceLimit = Math.floor(actor.system.lvl / 5);
  let hpMax = actor.system.hp.base, mpMax = actor.system.mp.base;
  let hitDieBox = '', manaDieBox = '';

  items.slice(0, diceLimit).forEach(rank => {
    if (rank.system.hp) {
      hpMax += rank.system.hp;
      const spent = rank.system.hitDieSpent;
      hitDieBox += _renderDieBox(rank, 'hit', 'hitDie', spent);
    }
    if (rank.system.mp) {
      mpMax += rank.system.mp;
      const spent = rank.system.manaDieSpent;
      manaDieBox += _renderDieBox(rank, 'mana', 'manaDie', spent);
    }
  });

  Object.assign(actor.system.hp, {
    max: hpMax,
    min: -Math.floor(hpMax / 2),
    value: Math.min(actor.system.hp.value, hpMax),
  });
  Object.assign(actor.system.mp, {
    max: mpMax,
    min: -Math.floor(mpMax / 2),
    value: Math.min(actor.system.mp.value, mpMax),
  });

  actor.system.sheet.dieBox = { hitDice: hitDieBox, manaDice: manaDieBox };
}

export function _preparePresence(actor) {
  const equipped = actor.itemTypes.equipment.filter(i => i.system.equipped);
  let usp = equipped.reduce((sum, item) => sum + (item.system.tier || 0), 0);
  usp = Math.min(usp, actor.system.pres);

  const unp = actor.system.pres - usp;
  Object.assign(actor.system, {
    unp,
    usp,
    attributes: {
      ...actor.system.attributes,
      unp: { ...actor.system.attributes.unp, value: unp }
    },
    presence: {
      max: actor.system.pres,
      min: 0,
      value: usp
    }
  });
}

function _renderDieBox(rank, type, dieProp, spent) {
  const iconClass = spent ? "fa-light" : "fa-solid";
  const rollClass = spent ? "rolled" : "unrolled";
  const action = spent ? "" : `data-action='roll${type === 'hit' ? "Hit" : "Mana"}Die'`;
  return `<div class="thover die-box ${rollClass}" data-die="${type}" data-id='${rank._id}' ${action} data-tooltip="${type === 'hit' ? "Hit" : "Mana"} Die">
      <i class="fa-fw ${iconClass} fa-dice-${rank.system[dieProp]}"></i></div>`;
}