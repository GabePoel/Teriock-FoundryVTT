export default function prepareDerivedData(actor) {
  prepareSize(actor);
  prepareBonuses(actor);
  prepareHpMp(actor);
  preparePresence(actor);
  prepareAttributes(actor);
  prepareTradecrafts(actor);
  prepareMoney(actor);
  prepareWeightCarried(actor);
  prepareDefenses(actor);
  prepareOffenses(actor);
  prepareEncumbrance(actor);
}

function prepareSize(actor) {
  const size = actor.system.size;
  const namedSizes = {
    0: 'Tiny',
    1: 'Small',
    3: 'Medium',
    5: 'Large',
    10: 'Huge',
    15: 'Gargantuan',
    20: 'Colossal',
  }
  const sizeKeys = Object.keys(namedSizes).map(Number);
  const filteredSizeKeys = sizeKeys.filter(key => key <= size);
  const sizeKey = Math.max(...filteredSizeKeys, 0);
  const namedSize = namedSizes[sizeKey] || 'Medium';
  actor.system.namedSize = namedSize;
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
  let hpMax = actor.system.hp.base, mpMax = actor.system.mp.base;
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

async function prepareEncumbrance(actor) {
  let encumbranceLevel = 0;
  if (actor.system.weightCarried >= actor.system.carryingCapacity.light) {
    encumbranceLevel = 1;
  }
  if (actor.system.weightCarried >= actor.system.carryingCapacity.heavy) {
    encumbranceLevel = 2;
  }
  if (actor.system.weightCarried >= actor.system.carryingCapacity.max) {
    encumbranceLevel = 3;
  }
  const hasCumbersome = actor.itemTypes.equipment
    .some(item => item.system.equipped && Array.isArray(item.system.properties) && item.system.properties.includes("cumbersome"));
  if (hasCumbersome) {
    encumbranceLevel += 1;
  }
  encumbranceLevel = Math.min(encumbranceLevel, 3);
  actor.system.encumbranceLevel = encumbranceLevel;
}