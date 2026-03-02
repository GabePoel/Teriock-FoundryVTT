const validAbilities = actor.abilities
  .filter((a) => !a.isReference && a.system.standard)
  .sort((a, b) => a.name.localeCompare(b.name));
const ability = await tm.dialogs.selectDocumentDialog(validAbilities, {
  hint: game.i18n.localize("TERIOCK.DIALOGS.Select.Ability.hint"),
  title: game.i18n.localize("TERIOCK.DIALOGS.Select.Ability.title"),
});
const buttons = scope.execution.buttons.filter(
  (button) => button.dataset.action === "apply-effect",
);
const button = buttons.find((b) => b.dataset.action === "apply-effect");
if (button) {
  button.dataset.bonusSubs = JSON.stringify([ability.uuid]);
}
scope.execution.buttons = buttons;
scope.execution.proficient = false;
scope.execution.fluent = false;
