//noinspection JSUnresolvedReference

/**
 * Clean excess terms from a document.
 * @param {GenericCommon} doc
 */
export function cleanDocument(doc) {
  delete doc.sort;
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
    cleanItem(doc);
    if (doc.type === "ability") cleanAbility(doc);
    if (doc.type === "body") cleanBody(doc);
    if (doc.type === "creature") cleanCreature(doc);
    if (doc.type === "equipment") cleanEquipment(doc);
    if (doc.type === "power") cleanPower(doc);
    if (doc.type === "property") cleanProperty(doc);
  }
  removeEmptyValues(doc);
}

/**
 * @param {GenericCommon} doc
 */
function cleanCommon(doc) {
  delete doc.system._ref;
  delete doc.system.deleteOnExpire;
  delete doc.system.disabled;
  delete doc.system.gmNotes;
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
  }

  // Clean Retired Tags
  delete doc.system.imports;
}

/**
 * @param {TeriockActiveEffect} doc
 */
function cleanActiveEffect(doc) {
  if (doc.tint === "#ffffff") delete doc.tint;
  delete doc.duration;
  if (!doc.disabled) delete doc.disabled;
  if (doc.transfer) delete doc.transfer;
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
 * @param {TeriockItem} doc
 */
function cleanItem(doc) {
  delete doc.system.onUse;
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
  cleanActiveEffect(doc);
  if (!doc.system.applyIfDampened) delete doc.system.applyIfDampened;
  if (!doc.system.applyIfShattered) delete doc.system.applyIfShattered;
  if (!doc.system.modifiesActor) delete doc.system.modifiesActor;
}

/**
 * @param {TeriockAbility} doc
 */
function cleanAbility(doc) {
  cleanActiveEffect(doc);

  // Clean Impacts
  if (doc.system.impacts) {
    if (doc.system.impacts.base) cleanAbilityImpact(doc.system.impacts.base);
    if (doc.system.impacts.proficient)
      cleanAbilityImpact(doc.system.impacts.proficient);
    if (doc.system.impacts.fluent)
      cleanAbilityImpact(doc.system.impacts.fluent);
    if (doc.system.impacts.heightened)
      cleanAbilityImpact(doc.system.impacts.heightened);
  }

  // Clean Costs
  if (doc.system.costs) {
    if (!doc.system.costs.verbal) delete doc.system.costs.verbal;
    if (!doc.system.costs.somatic) delete doc.system.costs.somatic;
    if (!doc.system.costs.material) delete doc.system.costs.material;
    if (doc.system.costs.mp?.type === "none") delete doc.system.costs.mp;
    if (doc.system.costs.hp?.type === "none") delete doc.system.costs.hp;
    if (doc.system.costs.gp?.type === "none") delete doc.system.costs.gp;
  }

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
  if (!doc.system.elderSorcery) delete doc.system.elderSorcery;
  if (!doc.system.sustained) delete doc.system.sustained;
  if (!doc.system.skill) delete doc.system.skill;
  if (!doc.system.spell) delete doc.system.spell;
  if (!doc.system.standard) delete doc.system.standard;
  if (!doc.system.ritual) delete doc.system.ritual;
  if (!doc.system.class) delete doc.system.class;
  if (!doc.system.rotator) delete doc.system.rotator;
  if (!doc.system.invoked) delete doc.system.invoked;
  if (!doc.system.basic) delete doc.system.basic;
  if (!doc.system.warded) delete doc.system.warded;
  if (!doc.system.consumable) delete doc.system.consumable;

  // Clean Retired Tags
  delete doc.system.secret;
  delete doc.system.prepared;
  if (doc.system.effectTypes) delete doc.system.effects;
}

/**
 * @param {AbilityImpact} impact
 */
function cleanAbilityImpact(impact) {
  if (impact.expiration) {
    if (!impact.expiration.changeOnCrit) {
      delete impact.expiration.crit;
    }
    if (!impact.expiration.doesExpire) {
      delete impact.expiration;
    }
  }
  if (!impact.duration) {
    delete impact.duration;
  }
  if (!impact.transformation?.enabled) {
    delete impact.transformation;
  }
  if (!impact.noTemplate) delete impact.noTemplate;
}

/**
 *
 * @param {object} obj
 * @returns {object}
 */
function removeEmptyValues(obj) {
  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === "") {
        obj.splice(i, 1);
      } else if (typeof obj[i] === "object" && obj[i] !== null) {
        removeEmptyValues(obj[i]);
      }
    }
  } else {
    for (const key in obj) {
      if (obj[key] === "") {
        delete obj[key];
      } else if (obj[key] === null) {
        delete obj[key];
      } else if (Array.isArray(obj[key]) && obj[key].length === 0) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        } else {
          removeEmptyValues(obj[key]);
        }
      }
    }
  }
  return obj;
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
