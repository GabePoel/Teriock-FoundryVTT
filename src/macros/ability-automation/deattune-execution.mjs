scope.execution.buttons = [];
const actor = scope.execution.actor;
const equipment = actor.equipment
  .filter((e) => e.system.isAttuned)
  .sort((a, b) => a.name.localeCompare(b.name));
const selectedEquipment = await tm.dialogs.selectDocumentsDialog(equipment, {
  hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Deattunable.hint"),
  title: game.i18n.localize("TERIOCK.DIALOGS.Select.Deattunable.title"),
});
await Promise.all(selectedEquipment.map((e) => e.system.deattune()));
