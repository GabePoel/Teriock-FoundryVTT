/** @import TeriockEquipmentData from "../equipment-data.mjs"; */
// const { api } = foundry.applications;

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _shatter(equipmentData) {
  await equipmentData.parent.update({ "system.shattered": true });
  await equipmentData.parent.disable();
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _repair(equipmentData) {
  await equipmentData.parent.update({ "system.shattered": false });
  if (equipmentData.equipped) {
    await equipmentData.parent.enable();
  }
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
  await equipmentData.parent.disable();
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _undampen(equipmentData) {
  await equipmentData.parent.update({ "system.dampened": false });
  if (equipmentData.equipped) {
    await equipmentData.parent.enable();
  }
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
  await equipmentData.parent.disable();
}

/**
 * @param {TeriockEquipmentData} equipmentData
 * @returns {Promise<void>}
 * @private
 */
export async function _equip(equipmentData) {
  if (!equipmentData.parent.consumable || (equipmentData.consumable && equipmentData.quantity >= 1)) {
    await equipmentData.parent.update({ "system.equipped": true });
    if (!equipmentData.shattered) {
      await equipmentData.parent.enable();
    }
    if (equipmentData.reference && !equipmentData.identified) {
      let doEquip = true;
      const ref = await foundry.utils.fromUuid(equipmentData.reference);
      // NOTE:Uncomment below to re-enable equip confirmation dialog for unidentified items.
      // const users = game.users.filter(u => u.active && u.isGM);
      // const referenceName = ref ? ref.name : 'Unknown';
      // let doEquip = false;
      // for (const user of users) {
      //   doEquip = await api.DialogV2.query(user, 'confirm', {
      //     title: 'Equip Item',
      //     content: `Should ${game.user.name} equip and learn the tier of unidentified ${referenceName}?`,
      //     modal: true,
      //   })
      // }
      if (doEquip && ref) {
        await equipmentData.parent.update({
          "system.tier.raw": ref.system.tier.raw,
        });
      }
    }
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
