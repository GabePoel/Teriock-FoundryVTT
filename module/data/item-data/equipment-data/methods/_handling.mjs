/** @import TeriockEquipmentData from "../equipment-data.mjs"; */
// const { api } = foundry.applications;

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _shatter(equipmentData) {
  await equipmentData.parent.update({ "system.shattered": true });
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _repair(equipmentData) {
  await equipmentData.parent.update({ "system.shattered": false });
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _setShattered(equipmentData, bool) {
  if (bool) {
    await _shatter(equipmentData);
  } else {
    await _repair(equipmentData);
  }
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _toggleShattered(equipmentData) {
  await _setShattered(equipmentData, !equipmentData.shattered);
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _dampen(equipmentData) {
  await equipmentData.parent.update({ "system.dampened": true });
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _undampen(equipmentData) {
  await equipmentData.parent.update({ "system.dampened": false });
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _setDampened(equipmentData, bool) {
  if (bool) {
    await _dampen(equipmentData);
  } else {
    await _undampen(equipmentData);
  }
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _toggleDampened(equipmentData) {
  await _setDampened(equipmentData, !equipmentData.dampened);
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _unequip(equipmentData) {
  await equipmentData.parent.update({ "system.equipped": false });
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _equip(equipmentData) {
  if (!equipmentData.parent.consumable || (equipmentData.consumable && equipmentData.quantity >= 1)) {
    await equipmentData.parent.update({ "system.equipped": true });
  }
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _setEquipped(equipmentData, bool) {
  if (bool) {
    await _equip(equipmentData);
  } else {
    await _unequip(equipmentData);
  }
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _toggleEquipped(equipmentData) {
  if (equipmentData.equipped) {
    await _unequip(equipmentData);
  } else {
    await _equip(equipmentData);
  }
}
