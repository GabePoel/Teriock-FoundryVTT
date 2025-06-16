// const { api } = foundry.applications;

export async function _shatter(equipment) {
  await equipment.update({ 'system.shattered': true });
  await equipment.disable();
}

export async function _repair(equipment) {
  await equipment.update({ 'system.shattered': false });
  if (equipment.system.equipped) {
    await equipment.enable();
  }
}

export async function _setShattered(equipment, bool) {
  if (bool) {
    await _shatter(equipment);
  } else {
    await _repair(equipment);
  }
}

export async function _toggleShattered(equipment) {
  await _setShattered(equipment, !equipment.system.shattered);
}

export async function _dampen(equipment) {
  await equipment.update({ 'system.dampened': true });
  await equipment.disable();
}

export async function _undampen(equipment) {
  await equipment.update({ 'system.dampened': false });
  if (equipment.system.equipped) {
    await equipment.enable();
  }
}

export async function _setDampened(equipment, bool) {
  if (bool) {
    await _dampen(equipment);
  } else {
    await _undampen(equipment);
  }
}

export async function _toggleDampened(equipment) {
  await _setDampened(equipment, !equipment.system.dampened);
}

export async function _unequip(equipment) {
  await equipment.update({ 'system.equipped': false });
  await equipment.disable();
}

export async function _equip(equipment) {
  if ((!equipment.consumable) || (equipment.system.consumable && equipment.system.quantity >= 1)) {
    await equipment.update({ 'system.equipped': true });
    if (!equipment.system.shattered) {
      await equipment.enable();
    }
    if (equipment.system.reference && !equipment.system.identified) {
      let doEquip = true;
      const ref = await foundry.utils.fromUuid(equipment.system.reference);
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
        await equipment.update({
          'system.tier': ref.system.tier,
        })
      }
    }
  }
}

export async function _setEquipped(equipment, bool) {
  if (bool) {
    await _equip(equipment);
  } else {
    await _unequip(equipment);
  }
}

export async function _toggleEquipped(equipment) {
  if (equipment.system.equipped) {
    await _unequip(equipment);
  } else {
    await _equip(equipment);
  }
}