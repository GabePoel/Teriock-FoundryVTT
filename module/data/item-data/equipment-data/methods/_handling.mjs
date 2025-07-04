/**
 * Shatters equipment, making it unusable.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to shatter.
 * @returns {Promise<void>} Promise that resolves when the equipment is shattered.
 * @private
 */
export async function _shatter(equipmentData) {
  await equipmentData.parent.update({ "system.shattered": true });
}

/**
 * Repairs equipment, making it usable again.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to repair.
 * @returns {Promise<void>} Promise that resolves when the equipment is repaired.
 * @private
 */
export async function _repair(equipmentData) {
  await equipmentData.parent.update({ "system.shattered": false });
}

/**
 * Sets the shattered state of equipment.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to modify.
 * @param {boolean} bool - Whether the equipment should be shattered.
 * @returns {Promise<void>} Promise that resolves when the shattered state is set.
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
 * Toggles the shattered state of equipment.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to toggle.
 * @returns {Promise<void>} Promise that resolves when the shattered state is toggled.
 * @private
 */
export async function _toggleShattered(equipmentData) {
  await _setShattered(equipmentData, !equipmentData.shattered);
}

/**
 * Dampens equipment, reducing its effectiveness.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to dampen.
 * @returns {Promise<void>} Promise that resolves when the equipment is dampened.
 * @private
 */
export async function _dampen(equipmentData) {
  await equipmentData.parent.update({ "system.dampened": true });
}

/**
 * Removes dampening from equipment.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to undampen.
 * @returns {Promise<void>} Promise that resolves when the equipment is undampened.
 * @private
 */
export async function _undampen(equipmentData) {
  await equipmentData.parent.update({ "system.dampened": false });
}

/**
 * Sets the dampened state of equipment.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to modify.
 * @param {boolean} bool - Whether the equipment should be dampened.
 * @returns {Promise<void>} Promise that resolves when the dampened state is set.
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
 * Toggles the dampened state of equipment.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to toggle.
 * @returns {Promise<void>} Promise that resolves when the dampened state is toggled.
 * @private
 */
export async function _toggleDampened(equipmentData) {
  await _setDampened(equipmentData, !equipmentData.dampened);
}

/**
 * Unequips equipment from its current slot.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to unequip.
 * @returns {Promise<void>} Promise that resolves when the equipment is unequipped.
 * @private
 */
export async function _unequip(equipmentData) {
  await equipmentData.parent.update({ "system.equipped": false });
}

/**
 * Equips equipment to an appropriate slot.
 * Only equips if the equipment is not consumable or has sufficient quantity.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to equip.
 * @returns {Promise<void>} Promise that resolves when the equipment is equipped.
 * @private
 */
export async function _equip(equipmentData) {
  if (!equipmentData.parent.consumable || (equipmentData.consumable && equipmentData.quantity >= 1)) {
    await equipmentData.parent.update({ "system.equipped": true });
  }
}

/**
 * Sets the equipped state of equipment.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to modify.
 * @param {boolean} bool - Whether the equipment should be equipped.
 * @returns {Promise<void>} Promise that resolves when the equipped state is set.
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
 * Toggles the equipped state of equipment.
 * @param {TeriockEquipmentData} equipmentData - The equipment data to toggle.
 * @returns {Promise<void>} Promise that resolves when the equipped state is toggled.
 * @private
 */
export async function _toggleEquipped(equipmentData) {
  if (equipmentData.equipped) {
    await _unequip(equipmentData);
  } else {
    await _equip(equipmentData);
  }
}
