scope.chatData.system.buttons = [];
const actor = scope.abilityData.actor;
const equipment = actor.equipment
  .filter((e) => e.system.isAttuned)
  .sort((a, b) => a.name.localeCompare(b.name));
const selectedEquipment = await game.teriock.api.dialog.selectDocuments(
  equipment,
  {
    title: "Select Equipment",
    hint: "Select equipment to deattune.",
  },
);
for (const e of selectedEquipment) {
  await e.system.deattune();
}
