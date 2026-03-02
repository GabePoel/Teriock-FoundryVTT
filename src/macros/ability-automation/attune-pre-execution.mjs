scope.execution.buttons = [];
const actor = scope.execution.actor;
const equipment = actor.equipment
  .filter((e) => !e.system.isAttuned)
  .sort((a, b) => a.name.localeCompare(b.name));
const selectedEquipment = await tm.dialogs.selectDocumentsDialog(equipment, {
  hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Attunable.hint"),
  title: game.i18n.localize("TERIOCK.DIALOGS.Select.Attunable.title"),
  tooltip: true,
});
await Promise.all(selectedEquipment.map((e) => e.system.attune()));
