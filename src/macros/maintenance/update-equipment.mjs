const equipmentPack = game.teriock.packs.equipment();

ui.notifications.info("Pulling all equipment from wiki.");

async function processEquipment(equipmentName) {
  let equipmentItem = equipmentPack.index.find((e) => e.name === equipmentName);
  if (!equipmentItem) {
    equipmentItem = await game.teriock.Item.create(
      {
        name: equipmentName,
        type: "equipment",
        system: {
          equipmentType: equipmentName,
        },
      },
      { pack: "teriock.equipment" },
    );
  } else {
    equipmentItem = await foundry.utils.fromUuid(equipmentItem.uuid);
  }
  await equipmentItem.system.wikiPull({ notify: false });
}

const equipmentPromises = Object.values(TERIOCK.index.equipment).map(
  (equipmentName) => processEquipment(equipmentName),
);

await Promise.all(equipmentPromises);
ui.notifications.success("Done.");
