const spiritItem = actor?.itemTypes?.equipment?.find(
  (e) => e.name === "Spirit Item",
);

if (spiritItem) {
  await spiritItem.update({
    "system.disabled": true,
    "system.weight": 0,
  });
  await spiritItem.system.unequip();
  await spiritItem.system.deattune();
}
