//noinspection JSUnresolvedReference

/**
 * Clean excess terms from a document.
 * @param {AnyCommonDocument} doc
 */
export function cleanDocument(doc) {
  if (!["damage", "drain", "text"].includes(doc.type)) delete doc.sort;
  delete doc.ownership;
  if (!doc.folder) delete doc.folder;
  if (doc._stats) {
    delete doc._stats.createdTime;
    delete doc._stats.duplicateSource;
    delete doc._stats.exportSource;
    delete doc._stats.modifiedTime;
    delete doc._stats.ownership;
  }
  if (doc.system) {
    cleanCommon(doc);
    cleanActiveEffect(doc);
    if (doc.type === "character" || doc.type === "creature") cleanActor(doc);
    if (doc.system.automations) cleanAutomations(doc.system.automations);
    if (doc.type === "ability") cleanAbility(doc);
    if (doc.type === "body") cleanBody(doc);
    if (doc.type === "creature") cleanCreature(doc);
    if (doc.type === "equipment") cleanEquipment(doc);
    if (doc.type === "power") cleanPower(doc);
    if (doc.type === "property") cleanProperty(doc);
  }
}

/**
 * @param {AnyCommonDocument} doc
 */
function cleanCommon(doc) {
  delete doc.system._ref;
  delete doc.system.deleteOnExpire;
  delete doc.system.disabled;
  delete doc.system.gmNotes;
  if (typeof doc.system.attackPenalty === "object") {
    doc.system.attackPenalty = doc.system.attackPenalty.raw;
  }
  if (doc.system.qualifiers) {
    if (doc.system.qualifiers.ephemeral?.saved) {
      doc.system.qualifiers.ephemeral.raw =
        doc.system.qualifiers.ephemeral.saved;
      delete doc.system.qualifiers.ephemeral.saved;
    }
    if (isZero(doc.system.qualifiers.ephemeral?.raw)) {
      delete doc.system.qualifiers.ephemeral;
    }
    if (doc.system.qualifiers.suppressed?.saved) {
      doc.system.qualifiers.suppressed.raw =
        doc.system.qualifiers.suppressed.saved;
      delete doc.system.qualifiers.suppressed.saved;
    }
    if (isZero(doc.system.qualifiers.suppressed?.raw)) {
      delete doc.system.qualifiers.suppressed;
    }
  }
  if (!doc.system.consumable) {
    delete doc.system.quantity;
    delete doc.system.maxQuantity;
    delete doc.system.consumptionAmount;
  }

  // Clean Retired Tags
  delete doc.system.imports;
}

/**
 * @param {TeriockActiveEffect} doc
 */
function cleanActiveEffect(doc) {
  if (doc.tint === "#ffffff") delete doc.tint;
  if (doc.type === "ability" || doc.type === "property") doc.transfer = true;
  delete doc.duration;
  delete doc.start;
  if (!doc.disabled) delete doc.disabled;
  if (doc.showIcon) delete doc.showIcon;
  if (doc.system.revealed) delete doc.system.revealed;
}

/**
 * @param {TeriockActor} doc
 */
function cleanActor(doc) {
  if (doc.prototypeToken) {
    delete doc.prototypeToken.alpha;
    delete doc.prototypeToken.depth;
    delete doc.prototypeToken.disposition;
    delete doc.prototypeToken.light;
    delete doc.prototypeToken.lockRotation;
    delete doc.prototypeToken.occludable;
    delete doc.prototypeToken.prependAdjective;
    delete doc.prototypeToken.randomImg;
    delete doc.prototypeToken.rotation;
    delete doc.prototypeToken.sight;
    if (doc.prototypeToken.ring) {
      delete doc.prototypeToken.ring.colors;
      delete doc.prototypeToken.ring.effects;
      delete doc.prototypeToken.ring.subject;
    }
    if (doc.prototypeToken.texture) {
      delete doc.prototypeToken.texture.alphaThreshold;
      delete doc.prototypeToken.texture.anchorX;
      delete doc.prototypeToken.texture.anchorY;
      delete doc.prototypeToken.texture.fit;
      delete doc.prototypeToken.texture.scaleX;
      delete doc.prototypeToken.texture.scaleY;
      delete doc.prototypeToken.texture.tint;
    }
  }
  if (doc.system?.combat) {
    delete doc.system.combat.attackPenalty;
    delete doc.system.combat.hasReaction;
  }
  if (doc.system.hp) {
    delete doc.system.hp.max;
    delete doc.system.hp.min;
    delete doc.system.hp.morganti;
    delete doc.system.hp.temp;
  }
  if (doc.system.mp) {
    delete doc.system.mp.max;
    delete doc.system.mp.min;
    delete doc.system.mp.morganti;
    delete doc.system.mp.temp;
  }
  delete doc.system.lp;
  delete doc.system.weight;
  delete doc.system.detection;
  if (doc.system.scaling) delete doc.system.scaling.lvl;
}

/**
 * @param {TeriockCreature} doc
 */
function cleanCreature(doc) {
  delete doc.system.attributes;
  delete doc.system.attunements;
  delete doc.system.carryingCapacity;
  delete doc.system.deathBag;
  delete doc.system.interestRate;
  delete doc.system.money;
  delete doc.system.offense;
  delete doc.system.protections;
  delete doc.system.senses;
  delete doc.system.sheet;
  delete doc.system.speedAdjustments;
  delete doc.system.tradecrafts;
  delete doc.system.wither;
}

/**
 * @param {PiercingModel} piercing
 */
function cleanPiercing(piercing) {
  // Clean Legacy Keys
  if (piercing.av0 === false) delete piercing.av0;
  if (piercing.ub === false) delete piercing.ub;

  // Clean Current Keys
  if (isZero(piercing.raw)) delete piercing.raw;
}

/**
 * @param {TeriockPower} doc
 */
function cleanPower(doc) {
  delete doc.system.flaws;
}

/**
 * @param {TeriockArmament} doc
 */
function cleanArmament(doc) {
  if (doc.system.piercing) cleanPiercing(doc.system.piercing);
  if (typeof doc.system.damage?.base === "object") {
    doc.system.damage.base = doc.system.damage.base.raw;
  }
  if (typeof doc.system.damage?.twoHanded === "object") {
    doc.system.damage.twoHanded = doc.system.damage.twoHanded.raw;
  }
  if (isZero(doc.system.av?.raw)) {
    delete doc.system.av;
  }
  if (isZero(doc.system.bv?.raw)) {
    delete doc.system.bv;
  }
  if (!doc.system.spellTurning) delete doc.system.spellTurning;
  if (!doc.system.warded) delete doc.system.warded;
}

/**
 * @param {TeriockBody} doc
 */
function cleanBody(doc) {
  cleanArmament(doc);
  delete doc.system.impacts;
}

/**
 * @param {TeriockEquipment} doc
 */
function cleanEquipment(doc) {
  cleanArmament(doc);
  delete doc.system.dampened;
  delete doc.system.glued;
  delete doc.system.identification;
  delete doc.system.reference;
  delete doc.system.shattered;
  delete doc.system.stashed;
  delete doc.system.destroyed;
  delete doc.system.impacts;
  if (doc.system.storage && !doc.system.storage.enabled) {
    delete doc.system.storage;
  }
  if (!doc.system.price) delete doc.system.price;
  if (!doc.system.equipped) delete doc.system.equipped;
}

/**
 * @param {TeriockProperty} doc
 */
function cleanProperty(doc) {
  delete doc.system.impacts;
  if (!doc.system.consumable) delete doc.system.consumable;
  if (!doc.system.applyIfDampened) delete doc.system.applyIfDampened;
  if (!doc.system.applyIfShattered) delete doc.system.applyIfShattered;
  if (doc.system.applyIfUnequipped) delete doc.system.applyIfUnequipped;
}

/**
 * @param {TeriockAbility} doc
 */
function cleanAbility(doc) {
  // Clean Impacts
  if (doc.system.impacts) {
    delete doc.system.impacts;
  }

  // Clean Costs
  if (doc.system.costs) {
    trimObject(doc.system.costs);
  }

  // Clean Equipment Connections
  if (!doc.system.consumeSource) delete doc.system.consumeSource;
  if (!doc.system.grantOnly) delete doc.system.grantOnly;

  // Clean Upgrades
  if (doc.system.upgrades) {
    if (!doc.system.upgrades.competence?.attribute) {
      delete doc.system.upgrades.competence;
    }
    if (!doc.system.upgrades.score?.attribute) {
      delete doc.system.upgrades.score;
    }
  }

  // Clean Cost Modifications
  if (!doc.system.adept?.enabled) delete doc.system.adept;
  if (!doc.system.gifted?.enabled) delete doc.system.gifted;

  // Clean Tags
  if (!doc.system.basic) delete doc.system.basic;
  if (!doc.system.class) delete doc.system.class;
  if (!doc.system.consumable) delete doc.system.consumable;
  if (!doc.system.elderSorcery) delete doc.system.elderSorcery;
  if (!doc.system.guildmaster) delete doc.system.guildmaster;
  if (!doc.system.invoked) delete doc.system.invoked;
  if (!doc.system.lore) delete doc.system.lore;
  if (!doc.system.ritual) delete doc.system.ritual;
  if (!doc.system.rotator) delete doc.system.rotator;
  if (!doc.system.skill) delete doc.system.skill;
  if (!doc.system.spell) delete doc.system.spell;
  if (!doc.system.standard) delete doc.system.standard;
  if (!doc.system.sustained) delete doc.system.sustained;
  if (!doc.system.warded) delete doc.system.warded;

  // Clean Common Defaults
  if (doc.system.attackPenalty === "-3") delete doc.system.attackPenalty;

  // Clean Delivery
  if (typeof doc.system.delivery?.base === "string") {
    doc.system.delivery = doc.system.delivery.base;
  }

  // Clean Retired Tags
  delete doc.system.secret;
  delete doc.system.prepared;
  delete doc.system.duration.dawn;
  delete doc.system.duration.stationary;
  if (doc.system.effectTypes) delete doc.system.effects;
}

/**
 * @param {Record<string, Teriock.Automations.Any>} automations
 */
function cleanAutomations(automations) {
  const DEPRECATED_TYPES = ["start", "end", "apply", "resist", "useAbilities"];
  const TYPE_MIGRATIONS = {
    addExternal: "addDocuments",
    useExternal: "useDocuments",
    useLocal: "useDocuments",
  };
  for (const [k, v] of Object.entries(automations)) {
    if (Object.keys(TYPE_MIGRATIONS).includes(v.type)) {
      v.type = TYPE_MIGRATIONS[v.type];
    }
    if (DEPRECATED_TYPES.includes(v.type)) delete automations[k];
  }
  for (const a of Object.values(automations)) cleanAutomation(a);
}

/**
 * @param {Teriock.Automations.Any} automation
 */
function cleanAutomation(automation) {
  delete automation.transformation;
}

/**
 * @param {string|number} formula
 */
function isZero(formula) {
  return (
    (typeof formula === "string" || typeof formula === "number") &&
    (!formula || formula === "0")
  );
}

/** @param {object} obj */
function trimObject(obj) {
  if (!obj) return;
  if (typeof obj !== "object") return;
  for (const [k, v] of Object.entries(obj)) {
    if (!v) delete obj[k];
    if (typeof v === "object") {
      trimObject(v);
      if (v && Object.keys(v).length === 0) delete obj[k];
    }
  }
}
