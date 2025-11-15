const spiritItem = actor.equipment.find((e) => e.name === "Spirit Item");
if (spiritItem) {
  await spiritItem.setFlag("teriock", "weight", spiritItem.system.weight);
  await spiritItem.update({
    "system.disabled": true,
    "system.weight": 0,
  });
  await spiritItem.system.repair();
  await spiritItem.system.unequip();
  await spiritItem.system.deattune();
}
