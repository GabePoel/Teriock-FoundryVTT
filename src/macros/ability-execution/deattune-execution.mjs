scope.chatData.system.buttons = [];
const actor = scope.abilityData.actor;
const equipment = actor.equipment
  .filter((e) => e.system.isAttuned)
  .sort((a, b) => a.name.localeCompare(b.name));
const selectedEquipment = await game.teriock.api.dialogs.selectDocumentsDialog(
  equipment,
  {
    title: "Select Equipment",
    hint: "Select equipment to deattune.",
  },
);
await Promise.all(selectedEquipment.map((e) => e.system.deattune()));
