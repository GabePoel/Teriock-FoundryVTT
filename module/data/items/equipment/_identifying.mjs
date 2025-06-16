const { api, ux } = foundry.applications;

export async function _readMagic() {
  if (equipment.system.reference && !equipment.system.identified) {
    const users = game.users.filter(u => u.active && u.isGM);
    let doReadMagic = false;
    const ref = await foundry.utils.fromUuid(equipment.system.reference);
    const referenceName = ref ? ref.name : 'Unknown';
    const referenceUuid = ref ? ref.uuid : 'Unknown';
    ui.notifications.info(`Asking GMs to approve reading magic on ${equipment.name}.`);
    const content = await ux.TextEditor.enrichHTML(`<p>Should ${game.user.name} read magic on @UUID[${referenceUuid}]{${referenceName}}?</p>`);
    for (const user of users) {
      doReadMagic = await api.DialogV2.query(user, 'confirm', {
        title: 'Read Magic',
        content: content,
        modal: false,
      })
    }
    if (doReadMagic) {
      if (ref) {
        await equipment.update({
          'system.powerLevel': ref.system.powerLevel,
        })
      }
      ui.notifications.success(`${equipment.name} was successfully read.`);
    } else {
      ui.notifications.error(`${equipment.name} was not successfully read.`);
    }
  }
}

export async function _identify(equipment) {
  if (equipment.system.reference && !equipment.system.identified) {
    const users = game.users.filter(u => u.active && u.isGM);
    let doIdentify = false;
    const ref = await foundry.utils.fromUuid(equipment.system.reference);
    const referenceName = ref ? ref.name : 'Unknown';
    const referenceUuid = ref ? ref.uuid : 'Unknown';
    ui.notifications.info(`Asking GMs to approve identification of ${equipment.name}.`);
    const content = await ux.TextEditor.enrichHTML(`<p>Should ${game.user.name} identify @UUID[${referenceUuid}]{${referenceName}}?</p>`);
    for (const user of users) {
      doIdentify = await api.DialogV2.query(user, 'confirm', {
        title: 'Identify Item',
        content: content,
        modal: false,
      })
    }
    if (doIdentify) {
      const knownEffectNames = equipment.transferredEffects.map(e => e.name);
      const unknownEffects = ref.transferredEffects.filter(e => !knownEffectNames.includes(e.name));
      const unknownEffectData = unknownEffects.map(e => foundry.utils.duplicate(e));
      await equipment.createEmbeddedDocuments('ActiveEffect', unknownEffectData);
      const equipped = equipment.system.equipped;
      if (ref) {
        await equipment.update({
          'name': ref.name,
          'system': ref.system,
        })
      }
      if (equipped) {
        await equipment.equip();
      } else {
        await equipment.unequip();
      }
      ui.notifications.success(`${equipment.name} was successfully identified.`);
    } else {
      ui.notifications.error(`${equipment.name} was not successfully identified.`);
    }
  }
}

export async function _unidentify(equipment) {
  if (equipment.system.identified) {
    const reference = equipment.uuid;
    const copy = await equipment.duplicate();
    const name = 'Unidentified ' + equipment.system.equipmentType;
    const description = 'This item has not been identified.';
    const effects = copy.transferredEffects;
    const unidentifiedProperties = CONFIG.TERIOCK.equipmentOptions.unidentifiedProperties;
    const idsToRemove = effects.filter(e => e.type !== 'property' || !unidentifiedProperties.includes(e.name)).map(e => e._id);
    await copy.update({
      'name': name,
      'system.reference': reference,
      'system.description': description,
      'system.powerLevel': 'unknown',
      'system.tier': 0,
      'system.identified': false,
      'system.flaws': '',
      'system.notes': '',
      'system.fullTier': '',
      'system.manaStoring': '',
      'system.font': '',
    })
    await copy.deleteEmbeddedDocuments('ActiveEffect', idsToRemove);
    await copy.unequip();
  } else if (equipment.type === 'equipment') {
    ui.notifications.warn("This item is already unidentified.");
  }
}