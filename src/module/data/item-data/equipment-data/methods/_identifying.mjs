const { api, ux } = foundry.applications;

/**
 * Reads magic on equipment to reveal its power level.
 * Requires GM approval and updates the equipment with reference power level information.
 *
 * Relevant wiki pages:
 * - [Read Magic](https://wiki.teriock.com/index.php/Ability:Read_Magic)
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to read magic on.
 * @returns {Promise<void>} Promise that resolves when the magic reading is complete.
 * @private
 */
export async function _readMagic(equipmentData) {
  if (equipmentData.reference && !equipmentData.identified) {
    const activeGm = game.users.activeGM;
    const ref = await foundry.utils.fromUuid(equipmentData.reference);
    const referenceName = ref ? ref.name : "Unknown";
    const referenceUuid = ref ? ref.uuid : "Unknown";
    ui.notifications.info(
      `Asking GMs to approve reading magic on ${equipmentData.parent.name}.`,
    );
    const content = await ux.TextEditor.enrichHTML(
      `<p>Should ${game.user.name} read magic on @UUID[${referenceUuid}]{${referenceName}}?</p>`,
    );
    const doReadMagic = await api.DialogV2.query(activeGm, "confirm", {
      title: "Read Magic",
      content: content,
      modal: false,
    });
    if (doReadMagic) {
      if (ref) {
        await equipmentData.parent.update({
          "system.powerLevel": ref.system.powerLevel,
        });
      }
      ui.notifications.success(
        `${equipmentData.parent.name} was successfully read.`,
      );
    } else {
      ui.notifications.error(
        `${equipmentData.parent.name} was not successfully read.`,
      );
    }
  }
}

/**
 * Identifies equipment, revealing all its properties and effects.
 * Requires GM approval and copies all data from the reference equipment.
 *
 * Relevant wiki pages:
 * - [Identify](https://wiki.teriock.com/index.php/Ability:Identify)
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to identify.
 * @returns {Promise<void>} Promise that resolves when the identification is complete.
 * @private
 */
export async function _identify(equipmentData) {
  if (equipmentData.reference && !equipmentData.identified) {
    const activeGm = game.users.activeGM;
    const ref = await foundry.utils.fromUuid(equipmentData.reference);
    const referenceName = ref ? ref.name : "Unknown";
    const referenceUuid = ref ? ref.uuid : "Unknown";
    ui.notifications.info(
      `Asking GMs to approve identification of ${equipmentData.parent.name}.`,
    );
    const content = await ux.TextEditor.enrichHTML(
      `<p>Should ${game.user.name} identify @UUID[${referenceUuid}]{${referenceName}}?</p>`,
    );
    const doIdentify = await api.DialogV2.query(activeGm, "confirm", {
      title: "Identify Item",
      content: content,
      modal: false,
    });
    if (doIdentify) {
      const knownEffectNames = equipmentData.parent.transferredEffects.map(
        (e) => e.name,
      );
      const unknownEffects = ref.transferredEffects.filter(
        (e) => !knownEffectNames.includes(e.name),
      );
      const unknownEffectData = unknownEffects.map((e) =>
        foundry.utils.duplicate(e),
      );
      await equipmentData.parent.createEmbeddedDocuments(
        "ActiveEffect",
        unknownEffectData,
      );
      const refSystem = foundry.utils.duplicate(ref.system);
      delete refSystem.equipped;
      delete refSystem.dampened;
      delete refSystem.shattered;
      if (ref) {
        await equipmentData.parent.update({
          name: ref.name,
          system: refSystem,
        });
      }
      ui.notifications.success(
        `${equipmentData.parent.name} was successfully identified.`,
      );
    } else {
      ui.notifications.error(
        `${equipmentData.parent.name} was not successfully identified.`,
      );
    }
  }
}

/**
 * Removes identification from equipment, making it unidentified again.
 * Creates a copy with limited properties and removes most effects.
 *
 * @param {TeriockEquipmentData} equipmentData - The equipment data to unidentify.
 * @returns {Promise<void>} Promise that resolves when the unidentification is complete.
 * @private
 */
export async function _unidentify(equipmentData) {
  if (equipmentData.identified) {
    const reference = equipmentData.parent.uuid;
    const copy =
      /** @type {TeriockEquipment} */ await equipmentData.parent.duplicate();
    const name = "Unidentified " + equipmentData.equipmentType;
    const description = "This item has not been identified.";
    const effects = copy.transferredEffects;
    const unidentifiedProperties =
      CONFIG.TERIOCK.options.equipment.unidentifiedProperties;
    const idsToRemove = effects
      .filter(
        (e) =>
          e.type !== "property" || !unidentifiedProperties.includes(e.name),
      )
      .map((e) => e._id);
    await copy.update({
      name: name,
      "system.reference": reference,
      "system.description": description,
      "system.powerLevel": "unknown",
      "system.tier.raw": "",
      "system.tier.derived": 0,
      "system.identified": false,
      "system.flaws": "",
      "system.notes": "",
      "system.font": "",
      "system.equipped": false,
    });
    await copy.deleteEmbeddedDocuments("ActiveEffect", idsToRemove);
  } else if (equipmentData.parent.type === "equipment") {
    ui.notifications.warn("This item is already unidentified.");
  }
}
