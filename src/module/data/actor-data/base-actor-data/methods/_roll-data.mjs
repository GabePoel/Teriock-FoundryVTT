/**
 * Gets roll data for an actor system, including basic stats, attack data, class ranks, and tradecrafts.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get roll data for.
 * @returns {object} Object containing all roll data for the actor.
 */
export function _getRollData(actorData) {
  const data = {};
  data["data"] = foundry.utils.deepClone(actorData.toObject());
  basicData(actorData, data);
  presenceData(actorData, data);
  rankData(actorData, data);
  ageData(actorData, data);
  attributeData(actorData, data);
  tradecraftData(actorData, data);
  hpData(actorData, data);
  mpData(actorData, data);
  witherData(actorData, data);
  hackData(actorData, data);
  speedData(actorData, data);
  carryingData(actorData, data);
  defenseData(actorData, data);
  offenseData(actorData, data);
  moneyData(actorData, data);
  equipmentData(actorData, data);
  speciesData(actorData, data);
  return foundry.utils.deepClone(data);
}

/**
 * Adds basic actor data to the roll data object.
 * Includes level, size, weight, proficiency, and fluency bonuses.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function basicData(actorData, data) {
  Object.assign(data, {
    lvl: actorData.lvl,
    size: actorData.size,
    weight: actorData.weight,
    p: actorData.p,
    f: actorData.f,
  });
}

/**
 * Adds presence data to the roll data object.
 * Includes total presence, used presence, and unused presence.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function presenceData(actorData, data) {
  Object.assign(data, {
    pres: actorData.pres,
    "pres.used": actorData.usp,
    "pres.unused": actorData.unp,
  });
}

/**
 * Adds rank data to the roll data object.
 * Includes total rank and individual class/archetype ranks.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function rankData(actorData, data) {
  const actor = actorData.parent;
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

  data.rank = actorData.rank;
}

/**
 * Adds age data to the roll data object.
 *
 * @param {TeriockBaseActorData} _actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function ageData(_actorData, data) {
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
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function attributeData(actorData, data) {
  const attr = actorData.attributes;
  const attrKeys = [
    "int",
    "mov",
    "per",
    "snk",
    "str",
    "unp",
  ];

  for (const key of attrKeys) {
    const attribute = attr[key];
    data[`att.${key}`] = attribute.value;
    data[`att.${key}.pro`] = attribute.saveProficient ? 1 : 0;
    data[`att.${key}.flu`] = attribute.saveFluent ? 1 : 0;
    data[`att.${key}.save`] = attribute.saveBonus;
  }
}

/**
 * Adds tradecraft data to the roll data object.
 * Includes tradecraft check values, proficiency, talent, and expertise flags.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function tradecraftData(actorData, data) {
  for (const key of Object.keys(TERIOCK.index.tradecrafts)) {
    const tc = actorData.tradecrafts[key];
    let short = key.slice(0, 3);
    if (tc) {
      data[`tc.${short}`] = tc.bonus;
      data[`tc.${short}.pro`] = tc.proficient ? 1 : 0;
      data[`tc.${short}.tal`] = tc.extra >= 1 ? 1 : 0;
      data[`tc.${short}.exp`] = tc.extra >= 2 ? 1 : 0;
    } else {
      data[`tc.${short}`] = 0;
      data[`tc.${short}.pro`] = 0;
      data[`tc.${short}.tal`] = 0;
      data[`tc.${short}.exp`] = 0;
    }
  }
}

/**
 * Adds HP data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function hpData(actorData, data) {
  Object.assign(data, {
    hp: actorData.hp.value,
    "hp.base": actorData.hp.base,
    "hp.max": actorData.hp.max,
    "hp.min": actorData.hp.min,
    "hp.temp": actorData.hp.temp,
  });
}

/**
 * Adds MP data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function mpData(actorData, data) {
  Object.assign(data, {
    mp: actorData.mp.value,
    "mp.base": actorData.mp.base,
    "mp.max": actorData.mp.max,
    "mp.min": actorData.mp.min,
    "mp.temp": actorData.mp.temp,
  });
}

/**
 * Adds wither data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function witherData(actorData, data) {
  Object.assign(data, {
    wither: actorData.wither.value,
    "wither.value": actorData.wither.value,
    "wither.max": actorData.wither.max,
  });
}

/**
 * Adds hack data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function hackData(actorData, data) {
  const hackKeys = [
    "arm",
    "leg",
    "bod",
    "eye",
    "ear",
    "mou",
    "nos",
  ];

  for (const key of hackKeys) {
    const hack = actorData.hacks[key];
    if (hack) {
      data[`hack.${key}`] = hack.value;
    } else {
      data[`hack.${key}`] = 0;
    }
  }
}

/**
 * Adds speed data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function speedData(actorData, data) {
  const speedKeys = [
    "wal",
    "dif",
    "cra",
    "swi",
    "cli",
    "hid",
    "leh",
    "lev",
    "fly",
    "dig",
    "div",
  ];
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
    const adjustment = actorData.speedAdjustments[systemKey] || 0;
    data[`speed.${key}`] = adjustment;

    // Calculate feet per turn based on adjustment level
    let feetPerTurn = 0;
    switch (adjustment) {
      case 0:
        feetPerTurn = 0;
        break;
      case 1:
        feetPerTurn = actorData.movementSpeed.value / 4;
        break;
      case 2:
        feetPerTurn = actorData.movementSpeed.value / 2;
        break;
      case 3:
        feetPerTurn = actorData.movementSpeed.value;
        break;
      case 4:
        feetPerTurn = actorData.movementSpeed.value * 2;
        break;
    }
    data[`speed.feet`] = Math.floor(feetPerTurn);
  }
}

/**
 * Adds carrying capacity data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function carryingData(actorData, data) {
  const weightCarried = actorData.weightCarried || 0;
  const lightCap = actorData.carryingCapacity.light;
  const heavyCap = actorData.carryingCapacity.heavy;
  const maxCap = actorData.carryingCapacity.max;

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
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function defenseData(actorData, data) {
  Object.assign(data, {
    av: actorData.av,
    "av.worn": actorData.wornAc,
    "av.worn.bonus": 0, // Would need to be calculated from effects
    "av.nat": actorData.naturalAv,
    "av.nat.bonus": 0, // Would need to be calculated from effects
    ac: actorData.ac,
    bv: actorData.bv,
    def: actorData.ac + actorData.bv,
  });
}

/**
 * Adds offense data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function offenseData(actorData, data) {
  const weaponAv0 = actorData?.wielding.attacker.derived?.system.derivedAv0;
  const naturalAv0 = actorData.piercing === "av0" || actorData.piercing === "ub";
  const hasAv0 = weaponAv0 || naturalAv0;
  const weaponUb = actorData?.wielding.attacker.derived?.system.derivedUb;
  const naturalUb = actorData.piercing === "ub";
  const hasUb = weaponUb || naturalUb;
  const weaponWarded = actorData?.wielding.attacker.derived?.system.derivedWarded;
  Object.assign(data, {
    sb: actorData.sb ? 1 : 0,
    av0: hasAv0 ? 2 : 0,
    "av0.wep": weaponAv0 ? 2 : 0,
    "av0.abi": 0, // Determined by ability used.
    "av0.nat": naturalAv0 ? 2 : 0,
    ub: hasUb ? 1 : 0,
    "ub.wep": weaponUb ? 1 : 0,
    "ub.abi": 0, // Determined by ability used.
    "ub.nat": naturalUb ? 1 : 0,
    ward: weaponWarded ? 1 : 0,
    "ward.wep": weaponWarded ? 1 : 0,
    "ward.abi": 0, // Determined by ability used.
    atkPen: actorData.attackPenalty,
  });
}

/**
 * Adds money data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function moneyData(actorData, data) {
  const moneyKeys = [
    "cop",
    "sil",
    "gol",
    "ent",
    "fir",
    "pix",
    "sno",
    "dra",
    "moo",
    "mag",
    "hea",
  ];
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

  const currencyOptions = TERIOCK.options.currency || {};

  for (const key of moneyKeys) {
    const systemKey = moneyMap[key];
    const amount = actorData.money[systemKey] || 0;
    const currency = currencyOptions[systemKey];

    data[`money.${key}.num`] = amount;
    data[`money.${key}.val`] = currency ? amount * currency.value : 0;
    data[`money.${key}.weight`] = currency ? amount * currency.weight : 0;
  }

  // Combined currency values
  data["money.all.num"] = Object.values(actorData.money)
    .reduce((sum, val) => sum + (val || 0), 0) - actorData.money.total;
  data["money.all.val"] = actorData.money.total || 0;
  data["money.all.weight"] = actorData.moneyWeight || 0;

  // Coins only
  const coinKeys = [
    "cop",
    "sil",
    "gol",
  ];
  data["money.coi.num"] = coinKeys.reduce((sum, key) => sum + (data[`money.${key}.num`] || 0), 0);
  data["money.coi.val"] = coinKeys.reduce((sum, key) => sum + (data[`money.${key}.val`] || 0), 0);
  data["money.coi.weight"] = coinKeys.reduce((sum, key) => sum + (data[`money.${key}.weight`] || 0), 0);

  // Gemstones only
  const gemKeys = [
    "ent",
    "fir",
    "pix",
    "sno",
    "dra",
    "moo",
    "mag",
    "hea",
  ];
  data["money.gem.num"] = gemKeys.reduce((sum, key) => sum + (data[`money.${key}.num`] || 0), 0);
  data["money.gem.val"] = gemKeys.reduce((sum, key) => sum + (data[`money.${key}.val`] || 0), 0);
  data["money.gem.weight"] = gemKeys.reduce((sum, key) => sum + (data[`money.${key}.weight`] || 0), 0);
}

/**
 * Adds equipment data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData - The actor system to get data from.
 * @param {object} data - The roll data object to populate.
 */
function equipmentData(actorData, data) {
  // Primary attack weapon
  const primaryAttacker = actorData.wielding.attacker.derived;
  if (primaryAttacker) {
    addEquipmentData(data, "atk", primaryAttacker);
  }

  // Primary block weapon
  const primaryBlocker = actorData.wielding.blocker.derived;
  if (primaryBlocker) {
    addEquipmentData(data, "blo", primaryBlocker);
  }
}

/**
 * Helper function to add equipment data for a specific slot.
 *
 * @todo Add properties.
 * @param {object} data - The roll data object to populate.
 * @param {string} slot - The equipment slot (atk, blo).
 * @param {TeriockEquipment|null} equipment - The equipment item.
 */
function addEquipmentData(data, slot, equipment) {
  const equipmentData = equipment?.system;
  data[`${slot}.dmg`] = equipmentData.derivedDamage || "0";
  data[`${slot}.dmg.2h`] = equipmentData.derivedTwoHandedDamage || "0";
  data[`${slot}.range`] = equipmentData.range || 0;
  data[`${slot}.range.short`] = equipmentData.shortRange || 0;
  data[`${slot}.weight`] = equipmentData.weight || 0;
  data[`${slot}.tier`] = equipmentData.tier?.derived || 0;
  data[`${slot}.av`] = equipmentData.derivedAv || 0;
  data[`${slot}.bv`] = equipmentData.derivedBv || 0;
  data[`${slot}.str`] = equipmentData.minStr || -3;
  data[`${slot}.shattered`] = equipmentData.shattered ? 1 : 0;
  data[`${slot}.dampened`] = equipmentData.dampened ? 1 : 0;
  data[`${slot}.consumable`] = equipmentData.consumable ? 1 : 0;
  data[`${slot}.quantity`] = equipmentData.quantity || 1;
}

/**
 * Adds species data to the roll data object.
 *
 * @param {TeriockBaseActorData} actorData
 * @param {object} data
 */
function speciesData(actorData, data) {
  for (const species of actorData.species) {
    data[`species.${species}`] = 1;
  }
}
