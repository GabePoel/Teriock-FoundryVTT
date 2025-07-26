/**
 * Generic function to derive equipment property values with actor overrides and upgrades
 *
 * @param {TeriockEquipmentData} equipmentData
 * @param {string} property - The property name to check overrides for
 * @param {function} getInitialValue - Function to extract initial value from equipmentData
 * @param {function} combineValues - Function to combine current and override values
 * @param {function|null} applyUpgrade - Function to apply upgrade values (addition for numbers, concatenation for strings, etc.)
 * @returns {any}
 */
function _deriveEquipmentProperty(
  equipmentData,
  property,
  getInitialValue,
  combineValues,
  applyUpgrade,
) {
  let value = getInitialValue(equipmentData);
  let actor = /** @type {TeriockActor|null} */ equipmentData.actor;

  if (actor) {
    const overrides = actor.system.equipmentChanges.overrides;
    const upgrades = actor.system.equipmentChanges.upgrades;

    // Apply overrides in order: classes, types, names, ids
    for (const equipmentClass of equipmentData.equipmentClasses) {
      const classOverride = overrides.classes[equipmentClass]?.[property];
      if (classOverride !== undefined) {
        value = combineValues(value, classOverride);
      }
    }

    const typeOverride =
      overrides.types[equipmentData.equipmentType]?.[property];
    if (typeOverride !== undefined) {
      value = combineValues(value, typeOverride);
    }

    const nameOverride = overrides.names[equipmentData.parent.name]?.[property];
    if (nameOverride !== undefined) {
      value = combineValues(value, nameOverride);
    }

    const idOverride = overrides.ids[equipmentData.parent.id]?.[property];
    if (idOverride !== undefined) {
      value = combineValues(value, idOverride);
    }

    // Apply upgrades in the same order: classes, types, names, ids
    if (applyUpgrade) {
      for (const equipmentClass of equipmentData.equipmentClasses) {
        const classUpgrade = upgrades.classes[equipmentClass]?.[property];
        if (classUpgrade !== undefined) {
          value = applyUpgrade(value, classUpgrade);
        }
      }

      const typeUpgrade =
        upgrades.types[equipmentData.equipmentType]?.[property];
      if (typeUpgrade !== undefined) {
        value = applyUpgrade(value, typeUpgrade);
      }

      const nameUpgrade = upgrades.names[equipmentData.parent.name]?.[property];
      if (nameUpgrade !== undefined) {
        value = applyUpgrade(value, nameUpgrade);
      }

      const idUpgrade = upgrades.ids[equipmentData.parent.id]?.[property];
      if (idUpgrade !== undefined) {
        value = applyUpgrade(value, idUpgrade);
      }
    }
  }

  return value;
}

/**
 * Derived AV0 value.
 *
 * @param {TeriockEquipmentData} equipmentData
 * @returns {boolean}
 */
export function _derivedAv0(equipmentData) {
  return (
    _deriveEquipmentProperty(
      equipmentData,
      "av0",
      (data) => data.parent.effectKeys?.property?.has("av0"),
      (current, override) => override || current,
      null // No upgrade logic needed for booleans
    ) || _derivedUb(equipmentData)
  );
}

/**
 * Derived UB value.
 *
 * @param {TeriockEquipmentData} equipmentData
 * @returns {boolean}
 */
export function _derivedUb(equipmentData) {
  return _deriveEquipmentProperty(
    equipmentData,
    "ub",
    (data) => data.parent.effectKeys?.property?.has("ub"),
    (current, override) => override || current,
    null // No upgrade logic needed for booleans
  );
}

/**
 * Derived armor value.
 *
 * @param {TeriockEquipmentData} equipmentData
 * @returns {number}
 */
export function _derivedAv(equipmentData) {
  return _deriveEquipmentProperty(
    equipmentData,
    "av",
    (data) => data.av,
    (current, override) => Math.max(override || 0, current),
    (current, upgrade) => current + (upgrade || 0) // Addition for numbers
  );
}

/**
 * Derived block value.
 *
 * @param {TeriockEquipmentData} equipmentData
 * @returns {number}
 */
export function _derivedBv(equipmentData) {
  return _deriveEquipmentProperty(
    equipmentData,
    "bv",
    (data) => data.bv,
    (current, override) => Math.max(override || 0, current),
    (current, upgrade) => current + (upgrade || 0) // Addition for numbers
  );
}

/**
 * Helper function to format string upgrades with appropriate operators
 * 
 * @param {string} current - Current value
 * @param {string} upgrade - Upgrade value
 * @returns {string}
 */
function _formatStringUpgrade(current, upgrade) {
  if (!upgrade) return current;

  if (upgrade.startsWith('-')) {
    return `${current} - ${upgrade.slice(1)}`;
  } else if (upgrade.startsWith('*')) {
    return `${current} * ${upgrade.slice(1)}`;
  } else if (upgrade.startsWith('/')) {
    return `${current} / ${upgrade.slice(1)}`;
  } else {
    return `${current} + ${upgrade}`;
  }
}

/**
 * Derived damage dice.
 *
 * @param {TeriockEquipmentData} equipmentData
 * @returns {string}
 */
export function _derivedDamage(equipmentData) {
  return _deriveEquipmentProperty(
    equipmentData,
    "damage",
    (data) => data.damage,
    (current, override) => override || current,
    (current, upgrade) => _formatStringUpgrade(current, upgrade) // String concatenation with operators
  );
}

/**
 * Derived two-handed damage dice.
 *
 * @param {TeriockEquipmentData} equipmentData
 * @returns {string}
 */
export function _derivedTwoHandedDamage(equipmentData) {
  return _deriveEquipmentProperty(
    equipmentData,
    "twoHandedDamage",
    (data) => data.twoHandedDamage,
    (current, override) => override || current,
    (current, upgrade) => _formatStringUpgrade(current, upgrade) // String concatenation with operators
  );
}