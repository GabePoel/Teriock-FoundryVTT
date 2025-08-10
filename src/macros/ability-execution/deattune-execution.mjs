scope.chatData.system.buttons = [];
const actor = scope.abilityData.actor;
const equipment = actor.equipment
  .filter((e) => e.system.isAttuned)
  .sort((a, b) => a.name.localeCompare(b.name));
const selectedEquipmentUuids = await game.teriock.api.dialog.selectDocument(
  equipment,
  {
    title: "Select Equipment",
    hint: "Select equipment to deattune.",
    multi: true,
    tooltip: true,
  },
);
for (const uuid of selectedEquipmentUuids) {
  const selectedEquipment = await foundry.utils.fromUuid(uuid);
  await selectedEquipment.system.deattune();
}
