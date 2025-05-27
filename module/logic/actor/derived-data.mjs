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

// TODO: Make less messy.
async function prepareConditions(actor) {
  // Prevent recursion
  if (actor._isProcessingConditions) return;
  actor._isProcessingConditions = true;
  if (!actor.isOwner) return;

  try {
    const toggle = async (condition, active) => {
      if (actor.statuses.has(condition) !== active) {
        await actor.toggleStatusEffect(condition, { active });
      }
    };

    let encumberanceLevel = 0;
    if (actor.system.weightCarried >= actor.system.carryingCapacity.light) {
      encumberanceLevel = 1;
    }
    if (actor.system.weightCarried >= actor.system.carryingCapacity.heavy) {
      encumberanceLevel = 2;
    }
    if (actor.system.weightCarried >= actor.system.carryingCapacity.max) {
      encumberanceLevel = 3;
    }
    const hasCumbersome = actor.itemTypes.equipment
      .some(item => item.system.equipped && Array.isArray(item.system.properties) && item.system.properties.includes("cumbersome"));
    if (hasCumbersome) {
      encumberanceLevel += 1;
    }
    encumberanceLevel = Math.min(encumberanceLevel, 3);

    if (encumberanceLevel === 0) {
      await toggle('encumbered', false);
    } else if (encumberanceLevel === 1) {
      await toggle('encumbered', true);
    } else if (encumberanceLevel === 2) {
      await toggle('encumbered', true);
      await toggle('slowed', true);
    } else if (encumberanceLevel === 3) {
      await toggle('encumbered', true);
      await toggle('slowed', true);
      await toggle('immobilized', true);
    }

    if (actor.system.hp.value <= actor.system.hp.min) {
      await toggle('dead', true);
    }

    if (actor.statuses.has('down') && !(actor.statuses.has('unconscious') || actor.statuses.has('dead'))) {
      await toggle('down', false);
    }

    if (actor.statuses.has('ethereal') && (actor.statuses.has('unconscious') || actor.statuses.has('asleep'))) {
      await toggle('asleep', false);
      await toggle('unconscious', false);
      await toggle('dead', true);
    }

    if (actor.statuses.has('prone')) {
      await toggle('meleeDodging', false);
      await toggle('missileDodging', false);
    }

    if (actor.statuses.has('down') && actor.statuses.has('dueling')) {
      await toggle('dueling', false);
    }

    if (actor.statuses.has('wisping') && !actor.statuses.has('ethereal')) {
      await toggle('ethereal', true);
    }

    if (actor.statuses.has('ruined') && !actor.statuses.has('dead')) {
      await toggle('dead', true);
    }

    if (actor.statuses.has('dead')) {
      await toggle('asleep', false);
      await toggle('unconscious', false);
    }

    if (actor.statuses.has('dead') && !actor.statuses.has('down')) {
      await toggle('down', true);
    }

    if (actor.statuses.has('asleep') && !actor.statuses.has('unconscious')) {
      await toggle('unconscious', true);
    }

    if (actor.statuses.has('unconscious') && !actor.statuses.has('down')) {
      await toggle('down', true);
    }

    if (actor.statuses.has('down') && !actor.statuses.has('prone')) {
      await toggle('prone', true);
    }

  } finally {
    actor._isProcessingConditions = false;
  }
}
