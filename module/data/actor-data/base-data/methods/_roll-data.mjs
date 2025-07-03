/** @import TeriockBaseActorData from "../base-data.mjs"; */

/**
 * Gets roll data for an actor system, including basic stats, attack data, class ranks, and tradecrafts.
 * @param {TeriockBaseActorData} system - The actor system to get roll data for.
 * @returns {object} Object containing all roll data for the actor.
 * @private
 */
export function _getRollData(system) {
  const data = {};
  data["data"] = foundry.utils.deepClone(system.toObject());
  basicData(system, data);
  presenceData(system, data);
  rankData(system, data);
  ageData(system, data);
  attributeData(system, data);
  tradecraftData(system, data);
  hpData(system, data);
  mpData(system, data);
  witherData(system, data);
  hackData(system, data);
  speedData(system, data);
  damageData(system, data);
  carryingData(system, data);
  defenseData(system, data);
  offenseData(system, data);
  moneyData(system, data);
  equipmentData(system, data);
  return foundry.utils.deepClone(data);
}

/**
 * Adds basic actor data to the roll data object.
 * Includes level, size, weight, proficiency, and fluency bonuses.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function basicData(system, data) {
  Object.assign(data, {
    lvl: system.lvl,
    size: system.size,
    weight: system.weight,
    p: system.p,
    f: system.f,
  });
}

/**
 * Adds presence data to the roll data object.
 * Includes total presence, used presence, and unused presence.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function presenceData(system, data) {
  Object.assign(data, {
    pres: system.pres,
    "pres.used": system.usp,
    "pres.unused": system.unp,
  });
}

/**
 * Adds rank data to the roll data object.
 * Includes total rank and individual class/archetype ranks.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function rankData(system, data) {
  const actor = system.parent;
  const rankKeys = [
    "mag",
    "sem",
    "war", // Base classes
    "fla",
    "lif",
    "nat",
    "nec",
    "sto", // Mage classes
    "arc",
    "ass",
    "cor",
    "ran",
    "thi", // Rogue classes
    "ber",
    "due",
    "kni",
    "pal",
    "vet", // Warrior classes
  ];

  // Initialize all rank values to 0
  for (const key of rankKeys) {
    data[`rank.${key}`] = 0;
  }

  // Count ranks from actor's rank items
  for (const rank of actor.itemTypes.rank) {
    const classKey = rank.system.className?.slice(0, 3).toLowerCase();
    const archetypeKey = rank.system.archetype?.slice(0, 3).toLowerCase();

    if (classKey && rankKeys.includes(classKey)) {
      data[`rank.${classKey}`]++;
    }
    if (archetypeKey && rankKeys.includes(archetypeKey)) {
      data[`rank.${archetypeKey}`]++;
    }
  }

  data.rank = system.rank;
}

/**
 * Adds age data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function ageData(system, data) {
  // Age data would need to be added to the actor schema
  // For now, using placeholder values
  Object.assign(data, {
    age: 0,
    "age.max": 100,
    "age.effective": 0,
  });
}

/**
 * Adds attribute data to the roll data object.
 * Includes attribute values, save proficiency, fluency, and save bonuses.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function attributeData(system, data) {
  const attr = system.attributes;
  const attrKeys = ["int", "mov", "per", "snk", "str", "unp"];

  for (const key of attrKeys) {
    const attribute = attr[key];
    data[`att.${key}`] = attribute.value;
    data[`att.${key}.pro`] = attribute.saveProficient ? 1 : 0;
    data[`att.${key}.flu`] = attribute.saveFluent ? 1 : 0;
    data[`att.${key}.save`] = system[`${key}Save`];
  }
}

/**
 * Adds tradecraft data to the roll data object.
 * Includes tradecraft check values, proficiency, talent, and expertise flags.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function tradecraftData(system, data) {
  const tradecraftKeys = [
    "art",
    "bla",
    "bui",
    "che",
    "loc",
    "mar",
    "tai", // Artisan
    "cou",
    "enf",
    "gam",
    "inn",
    "pea",
    "per",
    "tra", // Mediator
    "car",
    "dip",
    "his",
    "mes",
    "pri",
    "scr",
    "tea", // Scholar
    "far",
    "her",
    "hun",
    "inv",
    "min",
    "tam",
    "tra", // Survivalist
    "met", // Prestige
  ];

  for (const key of tradecraftKeys) {
    const tc = system.tradecrafts[key];
    if (tc) {
      data[`tc.${key}`] = tc.bonus;
      data[`tc.${key}.pro`] = tc.proficient ? 1 : 0;
      data[`tc.${key}.tal`] = tc.extra >= 1 ? 1 : 0;
      data[`tc.${key}.exp`] = tc.extra >= 2 ? 1 : 0;
    } else {
      data[`tc.${key}`] = 0;
      data[`tc.${key}.pro`] = 0;
      data[`tc.${key}.tal`] = 0;
      data[`tc.${key}.exp`] = 0;
    }
  }
}

/**
 * Adds HP data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function hpData(system, data) {
  Object.assign(data, {
    hp: system.hp.value,
    "hp.base": system.hp.base,
    "hp.max": system.hp.max,
    "hp.min": system.hp.min,
    "hp.temp": system.hp.temp,
  });
}

/**
 * Adds MP data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function mpData(system, data) {
  Object.assign(data, {
    mp: system.mp.value,
    "mp.base": system.mp.base,
    "mp.max": system.mp.max,
    "mp.min": system.mp.min,
    "mp.temp": system.mp.temp,
  });
}

/**
 * Adds wither data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function witherData(system, data) {
  Object.assign(data, {
    wither: system.wither.value,
    "wither.value": system.wither.value,
    "wither.max": system.wither.max,
  });
}

/**
 * Adds hack data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function hackData(system, data) {
  const hackKeys = ["arm", "leg", "bod", "eye", "ear", "mou", "nos"];

  for (const key of hackKeys) {
    const hack = system.hacks[key];
    if (hack) {
      data[`hack.${key}`] = hack.value;
    } else {
      data[`hack.${key}`] = 0;
    }
  }
}

/**
 * Adds speed data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function speedData(system, data) {
  const speedKeys = ["wal", "dif", "cra", "swi", "cli", "hid", "leh", "lev", "fly", "dig", "div"];
  const speedMap = {
    wal: "walk",
    dif: "difficultTerrain",
    cra: "crawl",
    swi: "swim",
    cli: "climb",
    hid: "hidden",
    leh: "leapHorizontal",
    lev: "leapVertical",
    fly: "fly",
    dig: "dig",
    div: "dive",
  };

  for (const key of speedKeys) {
    const systemKey = speedMap[key];
    const adjustment = system.speedAdjustments[systemKey] || 0;
    data[`speed.${key}`] = adjustment;

    // Calculate feet per turn based on adjustment level
    let feetPerTurn = 0;
    switch (adjustment) {
      case 0:
        feetPerTurn = 0;
        break;
      case 1:
        feetPerTurn = system.movementSpeed.value / 4;
        break;
      case 2:
        feetPerTurn = system.movementSpeed.value / 2;
        break;
      case 3:
        feetPerTurn = system.movementSpeed.value;
        break;
      case 4:
        feetPerTurn = system.movementSpeed.value * 2;
        break;
    }
    data[`speed.feet`] = Math.floor(feetPerTurn);
  }
}

/**
 * Adds damage data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function damageData(system, data) {
  Object.assign(data, {
    "dmg.hand": system.damage.hand,
    "dmg.foot": system.damage.foot,
    "dmg.mouth": system.damage.mouth,
    "dmg.shield.buckler": system.damage.bucklerShield,
    "dmg.shield.large": system.damage.largeShield,
    "dmg.shield.tower": system.damage.towerShield,
  });
}

/**
 * Adds carrying capacity data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function carryingData(system, data) {
  const weightCarried = system.weightCarried || 0;
  const lightCap = system.carryingCapacity.light;
  const heavyCap = system.carryingCapacity.heavy;
  const maxCap = system.carryingCapacity.max;

  Object.assign(data, {
    "carry.weight": weightCarried,
    "carry.light": lightCap,
    "carry.light.hit": weightCarried >= lightCap ? 1 : 0,
    "carry.heavy": heavyCap,
    "carry.heavy.hit": weightCarried >= heavyCap ? 1 : 0,
    "carry.max": maxCap,
    "carry.max.hit": weightCarried >= maxCap ? 1 : 0,
  });
}

/**
 * Adds defense data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function defenseData(system, data) {
  Object.assign(data, {
    av: system.av,
    "av.worn": system.wornAc,
    "av.worn.bonus": 0, // Would need to be calculated from effects
    "av.nat": system.naturalAv,
    "av.nat.bonus": 0, // Would need to be calculated from effects
    ac: system.ac,
    bv: system.bv,
    def: system.ac + system.bv,
  });
}

/**
 * Adds offense data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function offenseData(system, data) {
  const weaponAv0 =
    system?.wielding.attacker.derived?.effectKeys?.property?.has("av0") ||
    system?.wielding.attacker.derived?.effectKeys?.property?.has("ub");
  const naturalAv0 = system.piercing === "av0" || system.piercing === "ub";
  const hasAv0 = weaponAv0 || naturalAv0;
  const weaponUb = system?.wielding.attacker.derived?.effectKeys?.property?.has("ub");
  const naturalUb = system.piercing === "ub";
  const hasUb = weaponUb || naturalUb;
  Object.assign(data, {
    sb: system.sb ? 1 : 0,
    av0: hasAv0 ? 2 : 0,
    "av0.wep": weaponAv0 ? 2 : 0,
    "av0.abi": 0, // Determined by ability used.
    "av0.nat": naturalAv0 ? 2 : 0,
    ub: hasUb ? 1 : 0,
    "ub.wep": weaponUb ? 1 : 0,
    "ub.abi": 0, // Determined by ability used.
    "ub.nat": naturalUb ? 1 : 0,
    atkPen: system.attackPenalty,
  });
}

/**
 * Adds money data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function moneyData(system, data) {
  const moneyKeys = ["cop", "sil", "gol", "ent", "fir", "pix", "sno", "dra", "moo", "mag", "hea"];
  const moneyMap = {
    cop: "copper",
    sil: "silver",
    gol: "gold",
    ent: "entTearAmber",
    fir: "fireEyeRuby",
    pix: "pixiePlumAmethyst",
    sno: "snowDiamond",
    dra: "dragonEmerald",
    moo: "moonOpal",
    mag: "magusQuartz",
    hea: "heartstoneRuby",
  };

  const currencyOptions = CONFIG.TERIOCK.currencyOptions || {};

  for (const key of moneyKeys) {
    const systemKey = moneyMap[key];
    const amount = system.money[systemKey] || 0;
    const currency = currencyOptions[systemKey];

    data[`money.${key}.num`] = amount;
    data[`money.${key}.val`] = currency ? amount * currency.value : 0;
    data[`money.${key}.weight`] = currency ? amount * currency.weight : 0;
  }

  // Combined currency values
  data["money.all.num"] = Object.values(system.money).reduce((sum, val) => sum + (val || 0), 0) - system.money.total;
  data["money.all.val"] = system.money.total || 0;
  data["money.all.weight"] = system.moneyWeight || 0;

  // Coins only
  const coinKeys = ["cop", "sil", "gol"];
  data["money.coi.num"] = coinKeys.reduce((sum, key) => sum + (data[`money.${key}.num`] || 0), 0);
  data["money.coi.val"] = coinKeys.reduce((sum, key) => sum + (data[`money.${key}.val`] || 0), 0);
  data["money.coi.weight"] = coinKeys.reduce((sum, key) => sum + (data[`money.${key}.weight`] || 0), 0);

  // Gemstones only
  const gemKeys = ["ent", "fir", "pix", "sno", "dra", "moo", "mag", "hea"];
  data["money.gem.num"] = gemKeys.reduce((sum, key) => sum + (data[`money.${key}.num`] || 0), 0);
  data["money.gem.val"] = gemKeys.reduce((sum, key) => sum + (data[`money.${key}.val`] || 0), 0);
  data["money.gem.weight"] = gemKeys.reduce((sum, key) => sum + (data[`money.${key}.weight`] || 0), 0);
}

/**
 * Adds equipment data to the roll data object.
 * @param {TeriockBaseActorData} system - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 * @returns {void}
 * @private
 */
function equipmentData(system, data) {
  // Primary attack weapon
  const primaryAttacker = system.wielding.attacker.derived;
  if (primaryAttacker) {
    addEquipmentData(data, "atk", primaryAttacker);
  }

  // Primary block weapon
  const primaryBlocker = system.wielding.blocker.derived;
  if (primaryBlocker) {
    addEquipmentData(data, "blo", primaryBlocker);
  }
}

/**
 * Helper function to add equipment data for a specific slot.
 * @todo Add properties.
 * @param {object} data - The roll data object to populate.
 * @param {string} slot - The equipment slot (atk, blo).
 * @param {TeriockEquipment|null} equipment - The equipment item.
 * @returns {void}
 * @private
 */
function addEquipmentData(data, slot, equipment) {
  const sys = equipment?.system;
  data[`${slot}.dmg`] = sys.damage || "0";
  data[`${slot}.dmg.2h`] = sys.twoHandedDamage || "0";
  data[`${slot}.range`] = sys.range || 0;
  data[`${slot}.range.short`] = sys.shortRange || 0;
  data[`${slot}.weight`] = sys.weight || 0;
  data[`${slot}.tier`] = sys.tier?.derived || 0;
  data[`${slot}.av`] = sys.av || 0;
  data[`${slot}.bv`] = sys.bv || 0;
  data[`${slot}.str`] = sys.minStr || -3;
  data[`${slot}.shattered`] = sys.shattered ? 1 : 0;
  data[`${slot}.dampened`] = sys.dampened ? 1 : 0;
  data[`${slot}.consumable`] = sys.consumable ? 1 : 0;
  data[`${slot}.quantity`] = sys.quantity || 1;
}
