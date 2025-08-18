scope.chatData.system.buttons = [];
const actor = scope.abilityData.actor;
const equipment = actor.equipment
  .filter((e) => !e.system.isAttuned)
  .sort((a, b) => a.name.localeCompare(b.name));
const selectedEquipment = await game.teriock.api.dialogs.selectDocumentsDialog(
  equipment,
  {
    title: "Select Equipment",
    hint: "Select equipment to attune.",
    tooltip: true,
  },
);
await Promise.all(selectedEquipment.map((e) => e.system.attune()));
