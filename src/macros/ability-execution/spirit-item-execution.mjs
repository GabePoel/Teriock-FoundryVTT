let spiritItem = actor?.itemTypes?.equipment?.find(
  (e) => e.name === "Spirit Item",
);

// Create a spirit item if one doesn't already exist
if (!spiritItem) {
  const equipmentType =
    await game.teriock.api.dialogs.selectEquipmentTypeDialog();
  let spiritItems;
  if (equipmentType in CONFIG.TERIOCK.equipmentOptions.equipmentType) {
    const equipmentTypeName =
      CONFIG.TERIOCK.equipmentOptions.equipmentType[equipmentType];
    const spiritItemReference = await fromUuid(
      game.teriock.packs.equipment().index.getName(equipmentTypeName).uuid,
    );
    const spiritItemCopy = spiritItemReference.clone();
    spiritItemCopy.updateSource({
      name: "Spirit Item",
      "system.powerLevel": "magic",
      "system.consumable": false,
    });
    spiritItems = await actor.createEmbeddedDocuments("Item", [spiritItemCopy]);
  } else {
    spiritItems = await actor.createEmbeddedDocuments("Item", [
      {
        name: "Spirit Item",
        type: "equipment",
        system: {
          powerLevel: "magic",
          equipmentType: equipmentType,
          tier: { raw: "1" },
        },
      },
    ]);
  }
  spiritItem = spiritItems[0];
  await spiritItem.setFlag("teriock", "weight", spiritItem.system.weight);
  await spiritItem.update({
    "system.tier.raw": "1",
    "system.weight": 0,
  });
  await game.teriock.api.fetch.importProperty(spiritItem, "Master Crafted");
}
