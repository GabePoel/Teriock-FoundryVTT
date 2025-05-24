export default function prepareDerivedData(actor) {
  prepareBonuses(actor);
  prepareHpMp(actor);
  preparePresence(actor);
  prepareAttributes(actor);
  prepareTradecrafts(actor);
  prepareMoney(actor);
  prepareWeightCarried(actor);
  prepareDefenses(actor);
  prepareOffenses(actor);
  prepareConditions(actor);
}

function prepareBonuses(actor) {
  const lvl = actor.system.lvl;
  Object.assign(actor.system, {
    pres: Math.max(1, Math.floor(1 + (lvl + 1) / 5)),
    rank: Math.max(0, Math.floor((lvl - 1) / 5)),
    p: Math.max(0, Math.floor(1 + (lvl - 7) / 10)),
    f: Math.max(0, Math.floor((lvl - 2) / 5))
  });
}

function prepareHpMp(actor) {
  const items = actor.itemTypes.rank;
  const diceLimit = Math.floor(actor.system.lvl / 5);
  let hpMax = 1, mpMax = 1;
  let hitDieBox = '', manaDieBox = '';

  items.slice(0, diceLimit).forEach(rank => {
    if (rank.system.hp) {
      hpMax += rank.system.hp;
      const spent = rank.system.hitDieSpent;
      hitDieBox += actor._renderDieBox(rank, 'hit', 'hitDie', spent);
    }
    if (rank.system.mp) {
      mpMax += rank.system.mp;
      const spent = rank.system.manaDieSpent;
      manaDieBox += actor._renderDieBox(rank, 'mana', 'manaDie', spent);
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

function preparePresence(actor) {
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

// TODO: Test this before committing.
function prepareAttributes(actor) {
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

function _prepareTradecraft(actor, key) {
  const tc = actor.system.tradecrafts[key];
  tc.bonus = (tc.proficient ? actor.system.p : 0) + tc.extra;
}

function prepareTradecrafts(actor) {
  for (const key of Object.keys(actor.system.tradecrafts)) {
    _prepareTradecraft(actor, key);
  }
}

function prepareMoney(actor) {
  const money = actor.system.money;
  const currencyOptions = CONFIG.TERIOCK.currencyOptions;
  const total = Object.keys(currencyOptions).reduce((sum, key) => {
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

function prepareWeightCarried(actor) {
  const weight = actor.itemTypes.equipment
    .filter(i => i.system.equipped)
    .reduce((sum, i) => {
      return sum + (i.system.weight || 0);
    }, 0);
  const moneyWeight = Number(actor.system.moneyWeight) || 0;
  actor.system.weightCarried = Math.ceil(weight + moneyWeight);
}

function prepareDefenses(actor) {
  const sheet = actor.system.sheet;
  const equipment = actor.itemTypes.equipment;
  // Find and validate primary blocker
  if (sheet.primaryBlocker) {
    const blocker = equipment.find(i => i._id === sheet.primaryBlocker && i.system.equipped);
    actor.system.primaryBlocker = blocker || null;
  }
  // Block value
  actor.system.bv = actor.system.primaryBlocker?.system.bv || 0;
  // Armor value
  const equipped = equipment.filter(i => i.system.equipped);
  const av = Math.max(
    ...equipped.map(item => item.system.av || 0),
    actor.system.naturalAv || 0
  );
  actor.system.av = av;
  // Armor check
  actor.system.hasArmor = equipped.some(item =>
    Array.isArray(item.system.equipmentClasses) &&
    item.system.equipmentClasses.includes("armor")
  );
  // AC calculation
  let ac = 10 + av;
  if (actor.system.hasArmor) ac += actor.system.wornAc || 0;
  actor.system.ac = ac;
  actor.system.cc = ac + actor.system.bv;
}

function prepareOffenses(actor) {
  if (actor.system.sheet.primaryAttacker) {
    actor.system.primaryAttacker = actor.itemTypes.equipment.find(i => i._id === actor.system.sheet.primaryAttacker);
    if (!actor.system.primaryAttacker || !actor.system.primaryAttacker.system.equipped) {
      actor.system.sheet.primaryAttacker = null;
    }
  }
}

function prepareConditions(actor) {
  // const equippedItems = actor.itemTypes.equipment.filter(i => i.system.equipped);
  // const hasCumbersome = equippedItems.some(item =>
  //     Array.isArray(item.system.properties) &&
  //     item.system.properties.includes('cumbersome')
  // );
  // const lightOverCarrying = actor.system.weightCarried >= actor.system.carryingCapacity.light;
  // const heavyOverCarrying = (actor.system.weightCarried >= actor.system.carryingCapacity.heavy) || (lightOverCarrying && hasCumbersome);
  // if (lightOverCarrying || heavyOverCarrying || hasCumbersome) {
  //     actor.toggleStatusEffect('encumbered', { active: true });
  // } else {
  //     actor.toggleStatusEffect('encumbered', { active: false });
  // }
  // if (heavyOverCarrying) {
  //     actor.toggleStatusEffect('slowed', { active: true });
  // }
  // const hp = actor.system.hp.value;
  // const minHp = actor.system.hp.min;
  // if (hp === minHp) {
  //     actor.toggleStatusEffect('dead', { active: true });
  // }
  // if (actor.statuses.has('dead')) {
  //     actor.toggleStatusEffect('asleep', { active: false });
  //     actor.toggleStatusEffect('unconscious', { active: false });
  // }
  // if (actor.statuses.has('dead') && !actor.statuses.has('down')) {
  //     actor.toggleStatusEffect('down', { active: true });
  // }
  // if (actor.statuses.has('asleep') && !actor.statuses.has('unconscious')) {
  //     actor.toggleStatusEffect('unconscious', { active: true });
  // }
  // if (actor.statuses.has('unconscious') && !actor.statuses.has('down')) {
  //     actor.toggleStatusEffect('down', { active: true });
  // }
  // if (actor.statuses.has('wisping')) {
  //     actor.toggleStatusEffect('ethereal', { active: true });
  // }
}