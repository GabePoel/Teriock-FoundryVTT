/**
 * Generic function to derive equipment property values with actor overrides and upgrades
 * @param {TeriockEquipmentModel} equipmentData
 * @param {string} dataKey - The data key to check overrides for
 * @param {function} getInitialValue - Function to extract initial value from equipmentData
 * @param {function} combineValues - Function to combine current and override values
 * @param {function|null} applyUpgrade - Function to apply upgrade values (addition for numbers, concatenation for
 *   strings, etc.)
 * @returns {any}
 */
function deriveEquipmentDataValue(equipmentData, dataKey, getInitialValue, combineValues, applyUpgrade) {
  let value = getInitialValue(equipmentData);
  let actor = /** @type {TeriockActor|null} */ equipmentData.actor;

  if (actor) {
    const overrides = actor.system.equipmentChanges.overrides;
    const upgrades = actor.system.equipmentChanges.upgrades;

    // Apply overrides in order: classes, properties, types, names, ids
    for (const equipmentClass of equipmentData.equipmentClasses) {
      const classOverride = overrides.classes[equipmentClass]?.[dataKey];
      if (classOverride !== undefined) {
        value = combineValues(value, classOverride);
      }
    }

    for (const propertyKey of equipmentData.parent.effectKeys?.property || []) {
      const propertyOverride = overrides.properties[propertyKey]?.[dataKey];
      if (propertyOverride !== undefined) {
        value = combineValues(value, propertyOverride);
      }
    }

    const typeOverride = overrides.types[equipmentData.equipmentType]?.[dataKey];
    if (typeOverride !== undefined) {
      value = combineValues(value, typeOverride);
    }

    const nameOverride = overrides.names[equipmentData.parent.name]?.[dataKey];
    if (nameOverride !== undefined) {
      value = combineValues(value, nameOverride);
    }

    const idOverride = overrides.ids[equipmentData.parent.id]?.[dataKey];
    if (idOverride !== undefined) {
      value = combineValues(value, idOverride);
    }

    // Apply upgrades in order: classes, properties, types, names, ids
    if (applyUpgrade) {
      for (const equipmentClass of equipmentData.equipmentClasses) {
        const classUpgrade = upgrades.classes[equipmentClass]?.[dataKey];
        if (classUpgrade !== undefined) {
          value = applyUpgrade(value, classUpgrade);
        }
      }

      for (const propertyKey of equipmentData.parent.effectKeys?.property || []) {
        const propertyUpgrade = upgrades.properties[propertyKey]?.[dataKey];
        if (propertyUpgrade !== undefined) {
          value = combineValues(value, propertyUpgrade);
        }
      }

      const typeUpgrade = upgrades.types[equipmentData.equipmentType]?.[dataKey];
      if (typeUpgrade !== undefined) {
        value = applyUpgrade(value, typeUpgrade);
      }

      const nameUpgrade = upgrades.names[equipmentData.parent.name]?.[dataKey];
      if (nameUpgrade !== undefined) {
        value = applyUpgrade(value, nameUpgrade);
      }

      const idUpgrade = upgrades.ids[equipmentData.parent.id]?.[dataKey];
      if (idUpgrade !== undefined) {
        value = applyUpgrade(value, idUpgrade);
      }
    }
  }

  return value;
}

/**
 * Helper function to format string upgrades with appropriate operators
 *
 * @param {string} current - Current value
 * @param {string} upgrade - Upgrade value
 * @returns {string}
 */
function formatStringUpgrade(current, upgrade) {
  if (!upgrade) {
    return current;
  }

  if (upgrade.startsWith("-")) {
    return `${current} - ${upgrade.slice(1)}`;
  } else if (upgrade.startsWith("*")) {
    return `${current} * ${upgrade.slice(1)}`;
  } else if (upgrade.startsWith("/")) {
    return `${current} / ${upgrade.slice(1)}`;
  } else {
    return `${current} + ${upgrade}`;
  }
}

/**
 * Derived AV0 value.
 *
 * @param {TeriockEquipmentModel} equipmentData
 * @returns {boolean}
 */
export function _derivedAv0(equipmentData) {
  return (deriveEquipmentDataValue(
    equipmentData,
    "av0",
    (data) => data.parent.effectKeys?.property.has("av0"),
    (current, override) => override || current,
    null,
  ) || _derivedUb(equipmentData));
}

/**
 * Derived warded value.
 *
 * @param {TeriockEquipmentModel} equipmentData
 * @returns {boolean}
 */
export function _derivedWarded(equipmentData) {
  return deriveEquipmentDataValue(
    equipmentData,
    "ub",
    (data) => data.parent.effectKeys?.property.has("warded") || data.parent.effectKeys?.property.has("passivelyWarded"),
    (current, override) => override || current,
    null,
  );
}

/**
 * Derived UB value.
 *
 * @param {TeriockEquipmentModel} equipmentData
 * @returns {boolean}
 */
export function _derivedUb(equipmentData) {
  return deriveEquipmentDataValue(
    equipmentData,
    "ub",
    (data) => data.parent.effectKeys?.property.has("ub"),
    (current, override) => override || current,
    null,
  );
}

/**
 * Derived armor value.
 *
 * @param {TeriockEquipmentModel} equipmentData
 * @returns {number}
 */
export function _derivedAv(equipmentData) {
  return deriveEquipmentDataValue(
    equipmentData,
    "av",
    (data) => (data.av.value),
    (current, override) => Math.max(override || 0, current),
    (current, upgrade) => current + (upgrade || 0),
  );
}

/**
 * Derived block value.
 *
 * @param {TeriockEquipmentModel} equipmentData
 * @returns {number}
 */
export function _derivedBv(equipmentData) {
  return deriveEquipmentDataValue(
    equipmentData,
    "bv",
    (data) => data.bv.value,
    (current, override) => Math.max(override || 0, current),
    (current, upgrade) => current + (upgrade || 0),
  );
}

/**
 * Derived damage dice.
 *
 * @param {TeriockEquipmentModel} equipmentData
 * @returns {string}
 */
export function _derivedDamage(equipmentData) {
  return deriveEquipmentDataValue(
    equipmentData,
    "damage",
    (data) => data.damage.base.value + (equipmentData?.actor?.system.damage.standard || (""
      && data.damage.base.value
      && data.damage.base.value
      !== "0") ? " " + (equipmentData?.actor?.system.damage.standard || "") : ""),
    (current, override) => override || current,
    (current, upgrade) => formatStringUpgrade(current, upgrade),
  );
}

/**
 * Derived two-handed damage dice.
 *
 * @param {TeriockEquipmentModel} equipmentData
 * @returns {string}
 */
export function _derivedTwoHandedDamage(equipmentData) {
  return deriveEquipmentDataValue(
    equipmentData,
    "twoHandedDamage",
    (data) => (data.damage.twoHanded.value && data.damage.twoHanded.value !== "0"
      ? data.damage.twoHanded.value
      : data.damage.base.value) + ((equipmentData?.actor?.system.damage.standard || "") && (data.damage.base.value
      !== "0"
      || data.damage.twoHanded.value
      !== "0") ? " " + (equipmentData?.actor?.system.damage.standard || "") : ""),
    (current, override) => override || current,
    (current, upgrade) => formatStringUpgrade(current, upgrade),
  );
}
