const spiritItem = actor.equipment.find((e) => e.name === "Spirit Item");

if (spiritItem) {
  const updateData = { "system.disabled": false };

  if (spiritItem.system.weight > 0) {
    await spiritItem.setFlag("teriock", "weight", spiritItem.system.weight);
  } else if (spiritItem.getFlag("teriock", "weight")) {
    updateData["system.weight"] = spiritItem.getFlag("teriock", "weight");
  }

  await spiritItem.update(updateData);
  await spiritItem.system.repair();
  await spiritItem.system.equip();
  await spiritItem.system.attune();
}
